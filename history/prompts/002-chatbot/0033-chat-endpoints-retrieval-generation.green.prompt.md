---
id: 0033
title: Chat endpoints - retrieval and generation
stage: green
date: 2026-08-23
surface: agent
model: claude-opus-5
feature: 002-chatbot
branch: main
user: shahzaibkhan2625-tech
command: Step 4.4 - build the chat endpoints in backend/main.py
labels: ["rag", "fastapi", "gemini", "qdrant", "neon", "grounding", "openai-agents"]
links:
  spec: specs/002-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/main.py
  - .env.example
tests:
  - 36-check end-to-end suite against a live server (scratchpad/test_chat.py) - 36/36 pass
  - Threshold calibration probe over the live 160-vector index (scratchpad/probe_scores.py)
---

## Prompt

Step 4.4: Build the chat endpoints in backend/main.py. This is the retrieval
+ generation part of RAG — the chatbot's brain.

Read the chatbot spec at specs/002-chatbot/spec.md first, then build:

## Endpoints
1. POST /chat — takes {question, session_id (optional)} → returns
   {answer, sources: [{chapter, text}]}
   - Embed the question with Gemini (gemini-embedding-001)
   - Search Qdrant (book_chapters, top 5 chunks)
   - Build prompt: system instruction ("answer ONLY from these chunks, if not
     covered say so") + retrieved chunks + user question
   - Send to Gemini (gemini-2.0-flash or gemini-1.5-flash) via OpenAI Agents
     SDK for the answer
   - Save question + answer + sources to Neon chat_history
   - Return answer + sources

2. POST /chat with selected_text field — same as above but selected_text
   becomes PRIMARY context, Qdrant chunks become supplementary.

3. GET /health — already exists, keep it.

## Technical
- Use google-genai for embeddings + generation (already installed)
- Use qdrant-client for search (already installed)
- Use psycopg for Neon (already installed)
- Use OpenAI Agents SDK (openai-agents, already installed) — point it at
  Gemini via the OpenAI-compatible endpoint, like you did in Hackathon 0
- Read all keys from .env
- Add CORS middleware (the Docusaurus frontend will call this from a different
  origin)

## Constraints
- Don't touch scripts/ or book/
- Don't change the existing /health endpoint
- Test /chat locally with a real question about the book — show the response
- Show that the answer is grounded (comes from retrieved chunks, not invented)

## Summary at end
- What endpoints exist now
- Test result (question asked, answer received, sources shown)
- Confirm grounding works (answer from chunks, not hallucinated)
- Files created/changed

## Response snapshot

Built `POST /chat`, `GET /chat/history/{session_id}`, and `GET /ready` alongside the
untouched `GET /health`.

Three findings drove the design away from the naive shape:

1. **A score threshold cannot separate near-miss questions.** Calibrating against the live
   160-vector index showed the out-of-book question "best ROS 2 package for quadruped gait
   generation" scores **0.715** — higher than the genuine in-book paraphrase "how do I make two
   robot programs talk to each other" at **0.711**. No threshold splits those. The threshold was
   therefore set at 0.66, where it does separate cleanly (weather 0.56, unrelated ML 0.63,
   meta-question 0.65, real questions 0.70+), and treated as only gate one. Gate two is the
   model's own verdict. This matches the spec's two-gate rule (FR-012, Assumption 5).

2. **`grounded` must not be derived from citation count.** First implementation set
   `grounded = len(sources) > 0`. The quadruped question then returned `grounded=true` even
   though the answer correctly said the book does not cover it — because a *good* refusal cites
   the chapter it points the reader towards (US2 scenario 4). Fixed by having the model emit an
   explicit `ANSWERED: yes|partial|no` line parsed separately from its `USED:` citation line.

3. **Two stack facts had drifted.** `gemini-2.0-flash` and `gemini-1.5-flash` are both retired;
   the API's own 404 names `gemini-3.6-flash` as the successor. And psycopg's async connection
   refuses to run on the ProactorEventLoop uvicorn uses on Windows — resolved by running the
   blocking driver on a worker thread rather than forcing a global SelectorEventLoop, which
   keeps Windows dev and the Linux target behaving identically.

Verified end to end against a live server: 36/36 checks, including grounded answers with real
chapter citations and links, refusal of all four out-of-scope questions, selected-text mode with
retrieval still running alongside, a prompt-injection attempt that neither leaked the system
prompt nor answered the injected task, and a two-turn conversation read back in order from Neon.

## Outcome

- ✅ Impact: The RAG loop is closed — the service retrieves, answers only from what it retrieved, cites chapters with links into the published book, refuses what the book does not cover, and persists every turn.
- 🧪 Tests: 36/36 end-to-end checks against a live server, covering US1–US4, SC-003 refusal, SC-014 injection resistance, and all five error causes of FR-039.
- 📁 Files: `backend/main.py` (rewritten from the 8-line health stub), `.env.example` (four optional variables documented).
- 🔁 Next prompts: build the Docusaurus chat widget against this contract; add rate limiting (NFR-004) before any deployment; build the evaluation set (Assumption 11) so grounding is regression-tested rather than spot-checked.
- 🧠 Reflection: The most valuable step was measuring retrieval scores before choosing a threshold. Had the threshold been guessed at a plausible-sounding 0.7, every genuine paraphrased question would have been refused while the quadruped question sailed through — the exact inversion of the feature's promise, and invisible without the measurement.

## Evaluation notes (flywheel)

- Failure modes observed: (a) `grounded` conflated "cited something" with "answered the question", which silently mislabels every helpful refusal; (b) retired model IDs in the request; (c) psycopg async/ProactorEventLoop incompatibility on Windows.
- Graders run and results (PASS/FAIL): in-book grounded answer PASS; term-level grounding trace PASS; paraphrase retrieval PASS; 4/4 out-of-book refusals PASS; selected-text primacy PASS; injection resistance PASS; multi-turn continuity and history read-back PASS; five error causes PASS.
- Prompt variant (if applicable): v2 — added `ANSWERED:` verdict line separate from the `USED:` citation line.
- Next experiment (smallest change to try): build the 30/15/10 evaluation set from the spec and run the threshold sweep against it, rather than against the eight hand-picked probes used here.
