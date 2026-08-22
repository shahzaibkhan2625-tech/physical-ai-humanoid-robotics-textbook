"""Ingest the book's MDX chapters into Qdrant Cloud.

Walks book/docs/, strips YAML frontmatter, splits each chapter into overlapping
chunks, embeds them with Gemini, and upserts them into the "book_chapters"
collection. Point IDs are derived from (file_path, chunk_index), so re-running
overwrites cleanly rather than duplicating.

Usage (from the repo root):
    backend/.venv/Scripts/python.exe scripts/ingest.py
    backend/.venv/Scripts/python.exe scripts/ingest.py --dry-run
    backend/.venv/Scripts/python.exe scripts/ingest.py --resume

Embedding runs against the Gemini free tier, which caps tokens per minute, so
the script paces itself and a full run takes a few minutes. If it does stop
early, --resume picks up from what is already in the collection.
"""

import argparse
import re
import sys
import time
import uuid
from os import getenv
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

REPO_ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = REPO_ROOT / ".env"
DOCS_DIR = REPO_ROOT / "book" / "docs"

COLLECTION = "book_chapters"
EMBED_MODEL = "gemini-embedding-001"
EMBED_DIM = 3072  # gemini-embedding-001 native size; returned pre-normalised

CHUNK_WORDS = 500
OVERLAP_WORDS = 100
BATCH_SIZE = 10

# The Gemini free tier caps embedding *tokens* per minute, not just requests, and
# a ~500-word chunk is roughly 700 tokens - so ten chunks is ~7k tokens a batch.
# Pace against a budget below the documented 30k TPM to leave headroom, since a
# rejected request still counts against the bucket.
TOKEN_BUDGET_PER_MIN = 20_000
WORDS_TO_TOKENS = 1.4
MAX_RETRIES = 5
RETRY_BASE_DELAY_S = 30.0  # a 429 here is a per-minute cap; wait out the window

FRONTMATTER_RE = re.compile(r"\A---\r?\n(.*?)\r?\n---\r?\n", re.DOTALL)
TITLE_RE = re.compile(r"^title:\s*(.+)$", re.MULTILINE)
H1_RE = re.compile(r"^#\s+(.+)$", re.MULTILINE)
MDX_COMMENT_RE = re.compile(r"\{/\*.*?\*/\}", re.DOTALL)


# --- reading -----------------------------------------------------------------


def split_frontmatter(raw: str) -> tuple[str, str]:
    """Return (frontmatter, body). Frontmatter is "" when there is none."""
    match = FRONTMATTER_RE.match(raw)
    if not match:
        return "", raw
    return match.group(1), raw[match.end() :]


def extract_title(frontmatter: str, body: str, fallback: str) -> str:
    """Prefer the frontmatter title, then the first H1, then the filename."""
    match = TITLE_RE.search(frontmatter)
    if match:
        return match.group(1).strip().strip("\"'")
    match = H1_RE.search(body)
    if match:
        return match.group(1).strip()
    return fallback


def module_name(path: Path) -> str:
    """Name the module from the sibling index.mdx, falling back to the folder."""
    if path.parent == DOCS_DIR:
        return "Introduction"
    index = path.parent / "index.mdx"
    if index.exists():
        frontmatter, body = split_frontmatter(index.read_text(encoding="utf-8"))
        return extract_title(frontmatter, body, path.parent.name)
    return path.parent.name


def chapter_files() -> list[Path]:
    """Every chapter .mdx under book/docs, excluding module landing pages."""
    return sorted(p for p in DOCS_DIR.rglob("*.mdx") if p.name != "index.mdx")


# --- chunking ----------------------------------------------------------------


def chunk_text(body: str) -> list[str]:
    """Split into ~CHUNK_WORDS chunks with ~OVERLAP_WORDS of overlap.

    Windows over whole lines rather than bare words so code blocks, tables and
    indentation survive intact in the stored chunk.
    """
    lines = body.strip().splitlines()
    counts = [len(line.split()) for line in lines]

    chunks: list[str] = []
    start = 0
    while start < len(lines):
        end = start
        words = 0
        while end < len(lines) and (words < CHUNK_WORDS or end == start):
            words += counts[end]
            end += 1

        chunk = "\n".join(lines[start:end]).strip()
        if chunk:
            chunks.append(chunk)

        if end >= len(lines):
            break

        # Step back far enough to carry ~OVERLAP_WORDS into the next chunk.
        back = end
        carried = 0
        while back > start + 1 and carried < OVERLAP_WORDS:
            back -= 1
            carried += counts[back]
        start = back

    return chunks


# --- embedding ---------------------------------------------------------------


class TokenPacer:
    """Keep a rolling 60-second token spend under TOKEN_BUDGET_PER_MIN."""

    def __init__(self) -> None:
        self.spent: list[tuple[float, int]] = []  # (timestamp, tokens)

    def wait_for(self, tokens: int) -> None:
        while True:
            now = time.monotonic()
            self.spent = [(t, n) for t, n in self.spent if now - t < 60.0]
            in_window = sum(n for _, n in self.spent)
            if in_window + tokens <= TOKEN_BUDGET_PER_MIN or not self.spent:
                self.spent.append((now, tokens))
                return
            # Sleep until the oldest spend ages out of the window.
            sleep_s = 60.0 - (now - self.spent[0][0]) + 0.5
            print(f"    pacing: {in_window} tok in window, waiting {sleep_s:.0f}s")
            time.sleep(sleep_s)

    def record_rejection(self, tokens: int) -> None:
        """A 429'd request still consumed quota - charge it to the window."""
        self.spent.append((time.monotonic(), tokens))


def estimate_tokens(texts: list[str]) -> int:
    return int(sum(len(t.split()) for t in texts) * WORDS_TO_TOKENS)


def embed_batch(
    client: genai.Client, texts: list[str], pacer: TokenPacer
) -> list[list[float]]:
    """Embed one batch, retrying with backoff when Gemini throttles us."""
    tokens = estimate_tokens(texts)
    delay = RETRY_BASE_DELAY_S
    for attempt in range(1, MAX_RETRIES + 1):
        pacer.wait_for(tokens)
        try:
            response = client.models.embed_content(
                model=EMBED_MODEL,
                contents=texts,
                config=types.EmbedContentConfig(
                    task_type="RETRIEVAL_DOCUMENT",
                    output_dimensionality=EMBED_DIM,
                ),
            )
            return [e.values for e in response.embeddings]
        except Exception as exc:  # noqa: BLE001 - retry on any transport/quota error
            pacer.record_rejection(tokens)
            if attempt == MAX_RETRIES:
                raise
            print(
                f"    embed attempt {attempt} failed ({type(exc).__name__}), "
                f"retrying in {delay:.0f}s",
                file=sys.stderr,
            )
            time.sleep(delay)
            delay *= 1.5
    raise RuntimeError("unreachable")


# --- main --------------------------------------------------------------------


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="chunk and report only; do not embed or write to Qdrant",
    )
    parser.add_argument(
        "--resume",
        action="store_true",
        help="keep the existing collection and only embed chunks not already in it",
    )
    args = parser.parse_args()

    if not ENV_PATH.exists():
        print(f"ERROR: no .env found at {ENV_PATH}", file=sys.stderr)
        return 1
    load_dotenv(ENV_PATH)

    if not DOCS_DIR.exists():
        print(f"ERROR: no docs directory at {DOCS_DIR}", file=sys.stderr)
        return 1

    files = chapter_files()
    if not files:
        print(f"ERROR: no chapter .mdx files under {DOCS_DIR}", file=sys.stderr)
        return 1

    # 1. Read and chunk every chapter.
    records: list[dict] = []
    print(f"Reading {len(files)} chapters from {DOCS_DIR.relative_to(REPO_ROOT)}\n")
    for path in files:
        rel_path = path.relative_to(REPO_ROOT).as_posix()
        frontmatter, body = split_frontmatter(path.read_text(encoding="utf-8"))
        body = MDX_COMMENT_RE.sub("", body)
        title = extract_title(frontmatter, body, path.stem)
        module = module_name(path)

        chunks = chunk_text(body)
        for index, chunk in enumerate(chunks):
            records.append(
                {
                    "id": str(uuid.uuid5(uuid.NAMESPACE_URL, f"{rel_path}#{index}")),
                    "text": chunk,
                    "chapter_title": title,
                    "module": module,
                    "file_path": rel_path,
                    "chunk_index": index,
                }
            )
        print(f"  {rel_path:<52} {len(chunks):>3} chunks  ({title})")

    total_chunks = len(records)
    print(f"\nTotal: {len(files)} chapters, {total_chunks} chunks")

    if args.dry_run:
        print("Dry run - nothing embedded or written.")
        return 0

    gemini_key = getenv("GEMINI_API_KEY")
    qdrant_url = getenv("QDRANT_URL")
    qdrant_key = getenv("QDRANT_API_KEY")
    missing = [
        name
        for name, value in (
            ("GEMINI_API_KEY", gemini_key),
            ("QDRANT_URL", qdrant_url),
            ("QDRANT_API_KEY", qdrant_key),
        )
        if not value
    ]
    if missing:
        print(f"ERROR: missing in .env: {', '.join(missing)}", file=sys.stderr)
        return 1

    # 2. Prepare the collection.
    qdrant = QdrantClient(url=qdrant_url, api_key=qdrant_key, timeout=60)
    try:
        qdrant.get_collections()
    except Exception as exc:  # noqa: BLE001 - turn any connect failure into advice
        print(f"\nERROR: cannot reach Qdrant at {qdrant_url}", file=sys.stderr)
        print(f"  {type(exc).__name__}: {str(exc).splitlines()[0]}", file=sys.stderr)
        print(
            "  A 404 here means the cluster URL does not resolve to a running\n"
            "  cluster - it was deleted, suspended, or the URL is stale. Check the\n"
            "  Qdrant Cloud dashboard and refresh QDRANT_URL/QDRANT_API_KEY in .env.\n"
            "  Nothing was embedded, so re-running after the fix costs nothing.",
            file=sys.stderr,
        )
        return 1

    exists = qdrant.collection_exists(COLLECTION)
    if args.resume and exists:
        # Point IDs are deterministic, so anything already stored is done.
        stored = qdrant.retrieve(
            COLLECTION, ids=[r["id"] for r in records], with_payload=False
        )
        done = {str(p.id) for p in stored}
        skipped = len(done)
        records = [r for r in records if r["id"] not in done]
        print(f"\nResuming '{COLLECTION}': {skipped} chunks already stored, {len(records)} to go")
        if not records:
            count = qdrant.count(COLLECTION, exact=True).count
            print(f"Nothing to do - collection already holds {count} vectors")
            return 0
    else:
        if exists:
            print(f"\nCollection '{COLLECTION}' exists - recreating it")
            qdrant.delete_collection(COLLECTION)
        else:
            print(f"\nCreating collection '{COLLECTION}'")
        qdrant.create_collection(
            collection_name=COLLECTION,
            vectors_config=VectorParams(size=EMBED_DIM, distance=Distance.COSINE),
        )

    # 3. Embed in batches and upsert as we go.
    gemini = genai.Client(api_key=gemini_key)
    pacer = TokenPacer()
    total_batches = (len(records) + BATCH_SIZE - 1) // BATCH_SIZE
    upserted = 0

    print(f"Embedding {len(records)} chunks in {total_batches} batches of {BATCH_SIZE}")
    for batch_no, start in enumerate(range(0, len(records), BATCH_SIZE), start=1):
        batch = records[start : start + BATCH_SIZE]
        # Prefix title and module so a chunk carries its own context into the vector.
        texts = [
            f"{r['module']} - {r['chapter_title']}\n\n{r['text']}" for r in batch
        ]
        vectors = embed_batch(gemini, texts, pacer)

        qdrant.upsert(
            collection_name=COLLECTION,
            points=[
                PointStruct(
                    id=record["id"],
                    vector=vector,
                    payload={
                        "text": record["text"],
                        "chapter_title": record["chapter_title"],
                        "module": record["module"],
                        "file_path": record["file_path"],
                        "chunk_index": record["chunk_index"],
                    },
                )
                for record, vector in zip(batch, vectors)
            ],
            wait=True,
        )
        upserted += len(batch)
        print(f"  batch {batch_no:>3}/{total_batches}  upserted {upserted}/{len(records)}")

    # 4. Confirm what actually landed.
    count = qdrant.count(COLLECTION, exact=True).count
    print(
        f"\nDone: {len(files)} chapters -> {total_chunks} chunks -> "
        f"{count} vectors in '{COLLECTION}' ({EMBED_DIM}-dim, cosine)"
    )
    if count != total_chunks:
        print(
            f"WARNING: expected {total_chunks} vectors but the collection holds {count}",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
