---
id: 0026
title: Module 4 Scaffold and Chapter 4.1 Voice-to-Action
stage: green
date: 2026-08-20
surface: agent
model: claude-opus-5
feature: 001-book
branch: main
user: shahzaibkhan2625-tech
command: chapter-writer subagent (draft-only, no reviewers)
labels: ["module-4", "vla", "whisper", "asr", "bounded-command-set", "draft-only"]
links:
  spec: specs/001-book/spec.md#41-voice-to-action-with-whisper
  ticket: specs/001-book/tasks.md#T027-T028
  adr: null
  pr: null
files:
  - book/docs/vla/_category_.json (created — label "Module 4 — Vision-Language-Action (VLA)", position 5)
  - book/docs/vla/index.mdx (created — Module 4 landing page, sidebar_position 1)
  - book/docs/vla/voice-to-action-whisper.mdx (created — Chapter 4.1, sidebar_position 2, 506 lines)
  - specs/001-book/verification-log.md (modified — 2 rows for 4.1, summary table, Module 4 note)
tests:
  - npm run build (book/) — SUCCESS, run independently by the orchestrator after the subagent; onBrokenLinks='throw' so all internal links resolved
  - voice_intent.py — executed on py -3.12 (Python 3.12.10), stdlib only; re-executed independently from the chapter's own code block, output matches the documented text block byte-for-byte across all 8 cases
  - python -m py_compile voice_command_node.py — passed (syntax only; example marked `pending-env`)
  - link audit — all 17 internal links in the two new pages verified against existing files; no links to the not-yet-written 4.2/4.3
---

## Prompt

Module 4, Chapter 4.1 — DRAFT ONLY. No reviewers. Follow tasks.md.

## Chapter 4.1
Use the chapter-writer subagent to write Chapter 4.1
"Voice-to-Action with Whisper" in the Module 4 folder (create it — likely
book/docs/vla/), applying the chapter-authoring skill and the spec's Chapter
Catalog entry for 4.1.

Key requirements:
- Create Module 4 folder + _category_.json + index.mdx (module landing: what
  Module 4 covers, capstone ahead, uses the humanoid from 1.4).
- Teach: speech-to-text with Whisper, how voice commands become ROS 2 actions,
  the voice → text → intent → action pipeline.
- Cross-link to 1.3 (agent node), 1.4 (humanoid), Module 3 (perception).
- Whisper runs on CPU (no GPU needed) → some code MAY be executable here.
  If plain Python (no ROS), execute and verify. If ROS needed, pending-env.
- Environment: Whisper, ROS 2 Jazzy, Ubuntu 24.04.
- Keep research minimal. Write early.

## Constraints
- NO reviewer agents. Draft + skill self-check only.
- All 4 parts. onBrokenLinks — only existing pages. Build green.
- Stop after 4.1.

## Summary: files created, chapter structure, build result, confirm no reviewers

## Response snapshot

Gathered context first (spec.md's 4.1 catalog entry at lines 429–447, tasks.md T027–T028,
Module 3's landing page as the tone model, FR-016/FR-017 on cross-linking and the single humanoid),
then briefed the `chapter-writer` subagent and verified its output independently.

**Module 4 landing page** deliberately inverts Module 3's hardware framing: Module 3 opens by
demanding an RTX GPU, Module 4 opens by saying no GPU is needed — Whisper's small models run on
CPU. What the reader needs instead is a microphone or a prerecorded clip, which addresses the
spec's own edge case at spec.md:157.

**Chapter 4.1 structure** (4-part shape, in order): Learning objectives → Why natural language is
the right interface for a humanoid → ASR and where Whisper fits (architecture, training data, the
size/latency table) → Local vs. service transcription (the latency/privacy trade-off) → The
pipeline named explicitly, voice → text → intent → action → Mis-transcription is a safety problem,
not a UX problem (T028's stated must) → Code example (environment + 2 examples) → 4 exercises →
closing.

**The code split is the point.** The intent mapper is pure Python — no `rclpy`, no `whisper`, no
third-party imports at all — which is exactly the separation Chapter 1.3 argued for between
deciding and acting, reapplied to deciding versus *transcribing*. That split is what made a real
execution possible on a Windows box with no ROS 2: `voice_intent.py` ran on Python 3.12.10 and is
this project's fifth `executed` row. The Whisper + `rclpy` node stays `pending-env`.

Verification done by the orchestrator rather than taken on the subagent's word: re-ran
`npm run build` (SUCCESS), re-extracted the chapter's own Python block and executed it (output
matched the documented block byte-for-byte), and grepped every internal link against the filesystem.

**One defect found and fixed**: the subagent changed the verification log's "Chapters `verified`"
denominator from 14 to 16, apparently counting module landing pages as chapters. FR-004 fixes the
book at exactly 14 chapters (4/4/3/3) and tasks.md's checkpoint says "All 14 chapters"; reverted
to `1 of 14`.

**Constraint confirmed**: no reviewer agents were run. `code-verifier` and `consistency-checker`
were not spawned by the orchestrator or the subagent. Module 4's review is T030a, which runs after
4.2 and 4.3 are also drafted. Stopped after 4.1; nothing committed.

## Outcome

- ✅ Impact: Module 4 scaffolded and Chapter 4.1 drafted — 12 of 14 chapters now exist. T027 and T028 satisfied to `drafted` state; the module's landing page states the CPU-only baseline that distinguishes it from Module 3.
- 🧪 Tests: `npm run build` SUCCESS with `onBrokenLinks: 'throw'`; `voice_intent.py` executed and independently reproduced; `voice_command_node.py` `py_compile`-clean but `pending-env`; all internal links audited against existing files.
- 📁 Files: 3 created under `book/docs/vla/`, 1 modified (`verification-log.md`).
- 🔁 Next prompts: T029 (Chapter 4.2, cognitive planning with LLMs — must cover grounding and plan validation before dispatch), then T030 (4.3 capstone, introduces no new concepts), then T030a (the Module 4 two-agent review over all three chapters at once).
- 🧠 Reflection: The pure-Python/ROS split is worth repeating deliberately in 4.2 — an LLM plan *validator* is likewise testable with no ROS and no model, so 4.2 has the same opportunity for a genuinely executed example that 4.1 just took.

## Evaluation notes (flywheel)

- Failure modes observed: (1) The subagent silently widened a book-wide invariant — the 14-chapter count in the verification log — while editing an unrelated part of the same file. Small, plausible-looking, and only caught by checking the diff against FR-004 rather than reading it for sense. (2) The bounded Whisper install was correctly abandoned rather than retried indefinitely, and recorded honestly in both the chapter and the log — the desired behaviour under the "do not rabbit-hole" instruction.
- Graders run and results (PASS/FAIL): build green PASS; documented-output-matches-execution PASS (re-verified independently, not trusted from the report); link integrity PASS; 4-part shape PASS; no-forward-links-to-4.2/4.3 PASS; chapter count invariant FAIL → fixed.
- Prompt variant (if applicable): draft-only brief with an explicit executable/pending-env split named up front, plus a time-boxed permission for the optional heavy dependency install.
- Next experiment (smallest change to try): tell the writer that edits to shared spec-side files must not change any number it did not itself add — the 14→16 drift was an edit to a summary row it had no reason to touch beyond incrementing counts.
