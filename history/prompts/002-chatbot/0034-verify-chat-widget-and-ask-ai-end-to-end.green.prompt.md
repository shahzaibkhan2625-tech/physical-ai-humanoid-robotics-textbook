---
id: 0034
title: Verify chat widget and Ask AI end-to-end
stage: green
date: 2026-08-23
surface: agent
model: claude-opus-5
feature: 002-chatbot
branch: main
user: shahzaibkhan2625-tech
command: Phase 5 verification - run backend + dev server, drive the widget in Chrome
labels: ["docusaurus", "react", "widget", "text-selection", "verification", "browser"]
links:
  spec: specs/002-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - book/src/components/ChatWidget/api.ts
  - book/src/components/ChatWidget/ChatContext.tsx
  - book/src/components/ChatWidget/index.tsx
  - book/src/components/ChatWidget/styles.module.css
  - book/src/components/SelectionAsk/index.tsx
  - book/src/components/SelectionAsk/styles.module.css
  - book/src/theme/Root.tsx
  - book/docusaurus.config.ts
tests:
  - "npm run typecheck - clean"
  - "npm run build - SUCCESS"
  - "Browser: widget renders bottom-right on a chapter page, opens and closes"
  - "Browser: grounded answer with source chips (session ce13280e, grounded=True, sources=2, persisted=True)"
  - "Browser: select text -> Ask AI -> answer scoped to the selection (grounded=True, sources=3, persisted=True)"
  - "Browser: conversation survives client-side navigation to another chapter (6 bubbles retained)"
  - "Browser: backend down -> 'Cannot reach the assistant right now' error bubble"
  - "Browser: backend 504 -> 'The answer took too long' error bubble"
---

## Prompt

The chat widget and text-select feature were built in the previous session but
verification was interrupted. Do these two things:

1. Start the backend (uvicorn) and the book dev server (npm start), then use
   claude-in-chrome to verify:
   - Chat widget appears (bottom-right), opens/closes
   - Type a question, answer comes from book chunks with sources
   - Select text on a page, "Ask AI" button appears, click it, answer scoped
     to selected text
   Report what works and what doesn't.

2. Then write a summary of ALL Phase 5 work so far:
   - Every file created/changed, what each does
   - How the widget works (technically)
   - How text-select works (technically)
   - What the backend URL is set to now
   - Build result
   - What's left (HF deploy)

Don't change any code. Test and report only.

## Response snapshot

Verified the Phase 5 widget (commit 9656257) against a live backend and the
Docusaurus dev server. No code was changed.

Every widget behaviour passed. The one failure found was in the backend's model
choice, not the frontend: `gemini-3.6-flash` (the `CHAT_MODEL` default in
`backend/main.py`) took 22.2s for a two-word reply and returned intermittent
`503 Service Unavailable`, so full RAG generation blew the 30s
`GENERATE_TIMEOUT_S` and the widget correctly rendered the backend's own timeout
message. A latency probe over three model ids showed `gemini-flash-latest`
answering in 1.8s and `gemini-2.5-flash` now 404 ("no longer available to new
users"). Re-running the backend with the already-supported
`GEMINI_CHAT_MODEL=gemini-flash-latest` override — no code edit — produced
grounded, cited answers in ~14s, and the selected-text path in ~33s (inflated by
two 503 retries).

Both turns shared session `ce13280e` and both persisted to Neon, so session
continuity and history writes work through the widget.

Two cosmetic defects observed, both in `ChatWidget/index.tsx` rendering:
answers are shown as plain text, so the model's markdown (`**bold**`) appears
literally; and two chunks from the same chapter produce two identical source
chips.

## Outcome

- ✅ Impact: Phase 5 confirmed working end to end — widget, sources, selected-text
  scoping, session continuity, cross-page persistence, and both error paths.
- 🧪 Tests: typecheck clean, `npm run build` SUCCESS, 8 browser checks passed.
- 📁 Files: none changed (verification only); PHR added.
- 🔁 Next prompts: deploy the backend to Hugging Face Spaces, then rebuild the
  book with `CHAT_API_URL` pointed at the Space and deploy to GitHub Pages.
- 🧠 Reflection: driving the real UI caught what neither the typecheck nor the
  build could — that the deliverable's felt behaviour depends on a backend
  default (`CHAT_MODEL`) that has quietly rotted since it was set.

## Evaluation notes (flywheel)

- Failure modes observed:
  - `CHAT_MODEL` default `gemini-3.6-flash` is now too slow/overloaded to meet
    NFR-001 (5s p95); it exceeds the service's own 30s timeout under a RAG prompt.
  - Model ids keep retiring (`gemini-2.5-flash` now 404s for new users), which is
    exactly the drift the overridable env var was added to absorb.
  - Answers render as plain text, so markdown emitted by the model leaks as
    literal `**` characters.
  - Duplicate source chips when two retrieved chunks share a chapter.
  - Process failure: an attempt to source `.env` in bash printed secret values
    into the session transcript. Never `eval`/`export` a dotenv file in a shell
    whose output is captured; load it inside the program instead.
- Graders run and results (PASS/FAIL): PASS - grounded answers with non-empty
  sources (FR-016/017), selection scoping (FR-021/022), cause-specific errors
  surfaced to the reader (FR-039).
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): set `GEMINI_CHAT_MODEL` in the
  deployed environment (and reconsider the in-code default) before measuring
  NFR-001 against the evaluation set.
