---
id: 0007
title: Specify RAG Chatbot Backend
stage: spec
date: 2026-08-09
surface: agent
model: claude-opus-5[1m]
feature: 002-chatbot
branch: 002-chatbot
user: shahzaibkhan2625-tech
command: /sp.specify
labels: ["spec", "chatbot", "rag", "retrieval", "grounding", "backend", "api-contract"]
links:
  spec: specs/002-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-chatbot/spec.md
  - specs/002-chatbot/checklists/requirements.md
  - history/prompts/002-chatbot/0007-specify-rag-chatbot-backend.spec.prompt.md
tests:
  - none (specification artifact; validated against specs/002-chatbot/checklists/requirements.md)
---

## Prompt

/sp.specify

Create the specification for the RAG chatbot (feature: chatbot).

## What this feature is
A retrieval-augmented chatbot embedded in the published textbook. It answers
reader questions using ONLY the book's own content, and can answer about a
specific passage the reader has selected. Backend only in this spec — the UI
widget is a later feature, but define the API it will need.

## How it works (RAG)
- Ingestion (offline): the book's MDX chapters are split into chunks, embedded
  with Gemini, and stored in Qdrant.
- Query time: the user question is embedded, similar chunks are retrieved from
  Qdrant, and question + retrieved context are sent to Gemini (via the OpenAI
  Agents SDK) to generate a grounded answer.
- Chat history is persisted in Neon Postgres.

## Required endpoints
- POST /chat — takes a question (and optional session id), returns a grounded
  answer plus which chunks/sources it used.
- Selected-text mode — the reader selects a passage; the answer is scoped to
  that passage as primary context.
- GET /health already exists — keep it.

## Requirements
- Answers MUST be grounded in retrieved book content; if the book does not
  cover something, the bot says so rather than inventing an answer.
- Model: Gemini via OpenAI Agents SDK. Embeddings: Gemini. Vectors: Qdrant.
  History: Neon Postgres.
- Secrets only via .env (per constitution).
- Each answer should expose its sources so the reader can verify.

## Out of scope (state explicitly)
- The chat UI widget and text-selection frontend (later feature)
- Deployment to Hugging Face Spaces (later phase)
- Auth, personalization, translation (later features)
- The book content itself (separate spec, 001-book)

## Success criteria
- A question answerable from the book gets a correct, grounded answer citing
  its source chunks.
- A question NOT covered by the book is refused honestly, not hallucinated.
- Selected-text mode scopes the answer to the chosen passage.
- Chat history persists across a session.

Do not write any backend code yet. Spec only. After creating it, summarize
what you defined and flag anything ambiguous you had to decide.

## Response snapshot

Created branch `002-chatbot` via `.specify/scripts/powershell/create-new-feature.ps1 -Number 2
-ShortName "chatbot"`.

Wrote `specs/002-chatbot/spec.md` containing:

- **Scope / out of scope** — the requested exclusions (widget, deployment, auth/personalization/
  translation, book content) plus analytics/feedback and answering anything outside the book.
- **5 prioritized user stories** — P1 grounded cited answer (ingestion delivered as part of it),
  P2 honest refusal, P3 selected-text scoping, P4 conversation continuity, P5 maintainer
  re-indexing. P2 is marked non-negotiable before any real reader exposure.
- **Edge cases** in four groups: input (empty, oversized, non-English, foreign selected text,
  instruction-like text, questions about the bot itself), retrieval (nothing retrieved, weak
  matches, contradictory passages, empty index), dependencies (model / vector store / history
  storage each failing independently, plus timeouts), and concurrency/volume.
- **40 functional requirements** across ingestion (FR-001…009), retrieval and grounding
  (FR-010…019), selected-text mode (FR-020…024), conversation and history (FR-025…032), and
  interface (FR-033…040); plus 7 NFRs covering latency, concurrency, secrets, rate limiting,
  observability, runtime, and automated grounding tests.
- **7 key entities** — Passage, Index, Ingestion run, Conversation, Turn, Source citation,
  Selected passage.
- **15 success criteria** measured against a defined evaluation set (30+ answerable questions,
  15+ out-of-scope, 10+ selected-passage), with SC-003 set at 100% refusal and explicitly not
  negotiable downward.
- **13 assumptions**, **5 dependencies**, **4 risks**.

Also wrote `specs/002-chatbot/checklists/requirements.md`; all 16 items pass after one iteration
of fixes, with the fixes recorded.

Two checklist-driven rewrites were applied to the first draft: named technologies (Gemini,
Qdrant, Neon Postgres, OpenAI Agents SDK) were moved out of the functional requirements into
Dependencies — the constitution already mandates the stack, so the spec states behaviour instead —
and `POST /chat` / `GET /health` were replaced by named operations, since HTTP verbs, paths, and
status codes are `/sp.plan` decisions. The existing health operation is preserved by FR-036.

Zero `[NEEDS CLARIFICATION]` markers. Six judgement calls were resolved as documented
assumptions: the interface contract belongs in this spec (per the explicit request), a
history-retrieval operation is required although unrequested, complete rather than streamed
responses, anonymous conversations where the identifier is the only access control, a two-gate
sufficiency rule for "the book covers this", and indefinite history retention pre-auth.

Two requirement areas absent from the request were added deliberately: prompt injection (the
selected-passage field is client-controlled and flows into generation) and per-dependency failure
behaviour — notably that history-storage failure must not cost the reader their answer.

No backend code was written, per the instruction.

## Outcome

- ✅ Impact: Feature `002-chatbot` specified end-to-end. The grounding promise is now expressed as
  a testable requirement chain rather than an aspiration, and the interface the later widget will
  consume is agreed before either side is built.
- 🧪 Tests: None — specification artifact. Validated against the 16-item quality checklist at
  `specs/002-chatbot/checklists/requirements.md` (all pass after iteration 1).
- 📁 Files: `specs/002-chatbot/spec.md` (new), `specs/002-chatbot/checklists/requirements.md`
  (new), this PHR.
- 🔁 Next prompts: `/sp.clarify` to settle streaming vs complete responses and the anonymous-session
  posture before the interface is frozen, then `/sp.plan`. This branch descends from `66f1818`
  ("docs: add book content spec (001-book)"), so the `001-book` spec is already committed here.
- 🧠 Reflection: The hard part of this spec was making "grounded" mean something a test can check.
  Splitting it into FR-011/012/013/015/017 plus a named evaluation set is what turns the core
  promise from a claim into a gate. Defining the evaluation set as a deliverable of the feature —
  rather than assuming one exists — was the change that made SC-001…008 measurable at all.

## Evaluation notes (flywheel)

- Failure modes observed: the first draft imported the request's named technologies straight into
  the functional requirements, which is the natural move when the request states the stack but
  produces constraints masquerading as requirements. Caught by checklist item "no implementation
  details" and fixed in iteration 1.
- Graders run and results (PASS/FAIL): `specs/002-chatbot/checklists/requirements.md` — 16/16 PASS
  after iteration 1 (initial pass: 14/16).
- Prompt variant (if applicable): none.
- Next experiment (smallest change to try): during `/sp.plan`, pin the sufficiency rule
  (Assumption 5) to concrete values and write the evaluation set skeleton first — every other
  quality decision in this feature is unmeasurable until that instrument exists.
