---
id: 0032
title: Run ingest and pace Gemini rate limits
stage: green
date: 2026-08-23
surface: agent
model: claude-opus-5
feature: 002-chatbot
branch: main
user: shahzaibkhan2625-tech
command: (direct prompt)
labels: ["rag", "ingestion", "qdrant", "rate-limits", "step-4.3"]
links:
  spec: specs/002-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - scripts/ingest.py
tests:
 - backend/.venv/Scripts/python.exe scripts/ingest.py --resume (PASS - 160/160 vectors, no 429s)
 - Semantic search smoke test, 2 queries (PASS - top-3 hits all from the correct chapter, 0.74-0.80)
 - Payload integrity check (PASS - UTF-8 em dash intact, code indentation preserved, 5 keys)
---

## Prompt

Qdrant URL fixed in .env (added :6333 port). Run ingest.py now.

## Response snapshot

Qdrant reachable (`collections=[]`). First full run embedded batch 1 (20 vectors) then died on
`429 RESOURCE_EXHAUSTED` from Gemini.

Diagnosed it as a per-minute cap rather than daily exhaustion: a single-chunk probe issued straight
after the failure succeeded. The free tier caps embedding *tokens* per minute (~30k), and batches of
20 chunks are ~14k tokens each — two back-to-back saturated the bucket. The original retry made it
worse: it re-sent the same 14k-token batch five times, keeping the bucket full.

Reworked the throttling in `scripts/ingest.py`:
- `BATCH_SIZE` 20 → 10 (~7k tokens/batch)
- Added `TokenPacer`, a rolling 60-second token-budget sleeper set to 20k TPM for headroom; it also
  charges rejected requests against the window, since a 429'd call still consumes quota
- Retry backoff base 2s → 30s, growth 2x → 1.5x (a 429 here means waiting out a minute window)
- Replaced the fixed inter-batch `sleep` with the pacer
- Added `--resume`: keeps the collection and skips chunks whose deterministic uuid5 IDs are already
  stored, so a mid-run failure doesn't re-spend quota on work already done
- Final verification now compares against the total chunk count, not the post-resume remainder

Resumed run: 20 already stored, 140 embedded in 14 batches, pacer slept 4–53s between batches,
**zero 429s**.

Final state — `book_chapters`: 160 points, status green, 3072-dim cosine.

Retrieval verified with live queries:
- "How do I describe a humanoid robot body in URDF?" → top 3 all *URDF: Describing a Humanoid* (0.801/0.797/0.790)
- "What does Whisper do in the voice pipeline?" → top 3 all *Voice-to-Action with Whisper* (0.757/0.756/0.743)

Payload spot-check confirmed clean UTF-8 (`Module 2 — Gazebo & Unity: The Digital Twin`) and that
code blocks kept their newlines and indentation, which is what the line-window chunker was for.

## Outcome

- ✅ Impact: RAG knowledge base is live — 15 chapters, 160 chunks, 160 vectors, retrieval returning correct chapters.
- 🧪 Tests: resumed ingest PASS (160/160, no rate-limit errors); 2-query semantic search PASS; payload integrity PASS.
- 📁 Files: `scripts/ingest.py` (throttling rework + `--resume`).
- 🔁 Next prompts: build the retrieval + answer endpoint in `backend/main.py`, wiring `book_chapters` to `chat_history`.
- 🧠 Reflection: the single-chunk probe after the 429 was the whole diagnosis — it separated "minute window" from "daily quota" in one call, and picking the wrong one would have meant either waiting a day or hammering the API.

## Evaluation notes (flywheel)

- Failure modes observed: naive exponential retry on a token-per-minute cap re-sends the same large payload and sustains the throttle instead of clearing it.
- Graders run and results (PASS/FAIL): vector count 160/160 PASS; retrieval relevance PASS; payload encoding PASS.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): read the `retry-after` hint from the 429 response rather than pacing against a hardcoded 20k TPM budget.
