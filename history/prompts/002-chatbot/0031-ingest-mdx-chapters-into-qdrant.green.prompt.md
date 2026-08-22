---
id: 0031
title: Ingest MDX chapters into Qdrant
stage: green
date: 2026-08-22
surface: agent
model: claude-opus-5
feature: 002-chatbot
branch: main
user: shahzaibkhan2625-tech
command: (direct prompt)
labels: ["rag", "ingestion", "qdrant", "gemini-embeddings", "step-4.3"]
links:
  spec: specs/002-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - scripts/ingest.py
tests:
 - backend/.venv/Scripts/python.exe scripts/ingest.py --dry-run (PASS - 15 chapters, 160 chunks)
 - Gemini gemini-embedding-001 batch embed smoke test (PASS - 2 vectors, dim honoured)
 - backend/.venv/Scripts/python.exe scripts/ingest.py (BLOCKED - Qdrant Cloud 404)
---

## Prompt

Step 4.3: Write the ingestion script that loads the book's MDX chapters into
Qdrant. This is the core RAG pipeline — without it, the chatbot has no
knowledge.

## What to build
Create scripts/ingest.py that:
1. Reads all .mdx chapter files from book/docs/ (recursively, skip index.mdx
   landing pages — only actual chapters).
2. For each file: strip YAML frontmatter, extract prose + code blocks as text.
3. Split into chunks (~500 words each, ~100 word overlap) — use a simple
   splitter, no LangChain needed.
4. Embed each chunk using Gemini (google-genai, model gemini-embedding-001).
5. Upsert into Qdrant Cloud with metadata: chapter_title, module, file_path,
   chunk_index.
6. Read all keys from .env (GEMINI_API_KEY, QDRANT_URL, QDRANT_API_KEY).

## Technical requirements
- Use qdrant-client (already in backend dependencies).
- Use google-genai for embeddings (already installed).
- Collection name: "book_chapters".
- Batch embeddings (not one-by-one) to avoid Gemini rate limits.
- Add retry/delay for rate limits (Gemini free tier throttles).
- Print progress: which file, how many chunks, total vectors.
- Run from backend/.venv Python (same as init_db.py).

## Constraints
- No LangChain — use qdrant-client and google-genai directly (tumhare stack
  mein hain, aur seedha use karna seekhna zaroori).
- Read .env from repo root.
- Don't touch any other files except scripts/ingest.py.
- After writing, RUN it — ingest the actual book into Qdrant.
- Show the final count: how many chunks, how many vectors in Qdrant.

## Summary at end
- File created, what it does
- How many chapters processed, total chunks, total vectors
- Any errors or rate limit issues
- Confirm Qdrant collection has data

## Response snapshot

Created `scripts/ingest.py` following the shape of `scripts/init_db.py` (repo-root `.env`,
`main() -> int`, `raise SystemExit(main())`).

Pipeline: `rglob("*.mdx")` under `book/docs/` excluding `index.mdx`; regex frontmatter strip with
title taken from frontmatter → first H1 → filename; module name resolved from the sibling
`index.mdx` title (`intro.mdx` → "Introduction"); line-window chunker at ~500 words with ~100 words
of overlap (windows over whole lines so code fences, tables and indentation survive); batches of 20
to `gemini-embedding-001` with `task_type=RETRIEVAL_DOCUMENT`, `output_dimensionality=3072`
(native, pre-normalised), exponential-backoff retry (5 attempts) plus a 1 s inter-batch delay;
upsert into `book_chapters` (3072-dim, cosine) with payload `text`, `chapter_title`, `module`,
`file_path`, `chunk_index`; point IDs are `uuid5(NAMESPACE_URL, "<rel_path>#<index>")` so re-runs
overwrite rather than duplicate. Added a `--dry-run` flag that chunks and reports without spending
embedding quota.

Verified before running: `google-genai` 2.17.0 and `qdrant-client` 1.19.0 are installed in
`backend/.venv`; `embed_content` accepts a list for `contents` (confirmed batching works with a
live 2-item call).

Dry run: **15 chapters → 160 chunks**.

The real run is blocked. `QDRANT_URL` is well-formed (36-char UUID subdomain,
`us-east-1-1.aws.cloud.qdrant.io`, resolves to 3.214.13.6) but every path — `/`, `/healthz`,
`/collections`, with and without `:6333`, with and without the API key — returns a plain-text
`404 page not found` with no Qdrant `server` header. Routing fails before auth, so the cluster
behind that ID is not running: deleted, suspended, or the URL is stale. Added a pre-flight
`get_collections()` check so the script exits 1 with that diagnosis instead of a raw traceback,
and it fails before spending any embedding quota.

## Outcome

- ✅ Impact: RAG ingestion pipeline written and verified end-to-end except the Qdrant write; 160 chunks ready to embed once the cluster is reachable.
- 🧪 Tests: `--dry-run` PASS (15 chapters, 160 chunks); Gemini batch embed smoke test PASS; full run exits 1 on Qdrant 404 with actionable message.
- 📁 Files: `scripts/ingest.py` (new, 1 file — no other files touched, per constraint).
- 🔁 Next prompts: refresh `QDRANT_URL`/`QDRANT_API_KEY` from the Qdrant Cloud dashboard, re-run ingest, then build the retrieval endpoint in `backend/main.py`.
- 🧠 Reflection: probing the endpoint directly (`/healthz` 404, no `server` header) separated "bad credentials" from "no cluster there" before writing a line of Qdrant code — worth doing on any managed-service integration.

## Evaluation notes (flywheel)

- Failure modes observed: Qdrant Cloud endpoint returns 404 at every path regardless of API key — cluster not routable.
- Graders run and results (PASS/FAIL): dry-run chunk count PASS; embedding batch call PASS; Qdrant connectivity FAIL.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): point `QDRANT_URL` at a local `docker run -p 6333:6333 qdrant/qdrant` to prove the upsert path, then swap back to Cloud.
