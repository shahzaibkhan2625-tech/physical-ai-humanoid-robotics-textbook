---
id: 0027
title: Chapter 4.2 Cognitive Planning with LLMs
stage: green
date: 2026-08-21
surface: agent
model: claude-opus-5
feature: 001-book
branch: main
user: shahzaibkhan2625-tech
command: chapter-writer subagent (draft-only, no reviewers)
labels: ["module-4", "vla", "llm-planning", "grounding", "plan-validation", "draft-only"]
links:
  spec: specs/001-book/spec.md#42-cognitive-planning-with-llms
  ticket: specs/001-book/tasks.md#T029
  adr: null
  pr: null
files:
  - book/docs/vla/cognitive-planning-llms.mdx (created — Chapter 4.2, sidebar_position 3)
  - book/docs/vla/index.mdx (modified — 4.2 mention converted from bold text to a link)
  - book/docs/vla/voice-to-action-whisper.mdx (modified — 4.1's closing sentence now links to 4.2)
  - specs/001-book/verification-log.md (modified — 2 rows for 4.2, summary counts, strict-mode defect recorded)
tests:
  - npm run build (book/) — SUCCESS, run twice: after the subagent finished and again after the strict-mode fix
  - plan_validator.py — executed on py -3.12; re-extracted independently from the shipped .mdx and re-run by the orchestrator, output matches the documented block (modulo CRLF)
  - python -m py_compile cognitive_planner_node.py — passed before and after the strict-mode edit
  - claude-api skill — loaded by the orchestrator to verify model ID and tool-use surface; caught the strict-mode defect
---

## Prompt

Draft Chapter 4.2 "Cognitive Planning with LLMs" at book/docs/vla/cognitive-planning-llms.mdx. DRAFT ONLY, no reviewers. Follow the chapter-authoring skill and spec catalog entry for 4.2. All 4 parts, build green, stop after 4.2. Keep research minimal, write early.

## Response snapshot

Read the spec's 4.2 catalog entry (spec.md:447) and T029, then briefed `chapter-writer`. The first
attempt died mid-research on an expired auth token; the repo was verified clean (no partial files,
no stray edits) and the identical brief was relaunched rather than resumed.

**Chapter structure**: Learning objectives → From an instruction to a goal nothing here can name
directly → The LLM as a planner, not an executor → Grounding: a plan may only use verbs the robot
has → Structured output as the contract between model and robot → Validating a plan before execution
→ Failure and replanning → Where VLA models fit → Code example → Exercises.

**The code split from 4.1 repeated, and it paid off again**: `plan_validator.py` is pure Python — no
ROS, no LLM SDK, no network — and is the project's sixth `executed` row. It covers ungrounded skills,
bad argument types, out-of-range values, over-length plans, malformed JSON, and missing arguments.
The Claude call plus `rclpy` dispatcher is `pending-env`.

**Filename**: built to the user's explicit `cognitive-planning-llms.mdx`, which differs from T029's
`cognitive-planning-with-llms.mdx`. Flagged for reconciliation; not silently resolved either way.

**Defect found and fixed.** The subagent could not load the `claude-api` skill (not present in this
repo's `.claude/skills/`) and verified the Anthropic API against `platform.claude.com` instead —
honestly reported. The orchestrator loaded the skill and checked the tool definition against it. The
model ID `claude-sonnet-5` and the call surface (`messages.create` with `tools`, forced
`tool_choice`, `tool_use` blocks off `response.content`) were all correct. But the tool carried
`strict: True`, which requires every object in the schema to declare `additionalProperties: false`.
The schema declared it nowhere — and its `args` field is an open per-skill map (`walk_to` takes
`x`/`y`, `place_on` takes `object_id`/`surface_id`) that cannot declare it at all. The documented
request would have been rejected by the API.

`strict` was removed and the surrounding prose rewritten: the chapter now explains *why* this schema
design and strict mode are incompatible, which strengthens rather than weakens its thesis — shape
was never the part in doubt, and the validator is what the system trusts.

## Outcome

- ✅ Impact: Chapter 4.2 drafted — 13 of 14 chapters now exist. T029's two named musts (grounding, plan validation before dispatch) are covered, with validation framed as the trust boundary between a fallible model and an actuator.
- 🧪 Tests: `npm run build` SUCCESS (twice); `plan_validator.py` independently re-extracted and re-executed with matching output; `cognitive_planner_node.py` `py_compile`-clean before and after the fix; API surface checked against the `claude-api` skill.
- 📁 Files: 1 created, 3 modified.
- 🔁 Next prompts: T030 (Chapter 4.3, the capstone — introduces no new concepts, every component must cite the chapter that taught it), then T030a (the Module 4 two-agent review over all three chapters), then T031/T032.
- 🧠 Reflection: The subagent lacked the `claude-api` skill and said so instead of pretending otherwise — that honesty is what made the defect findable. Worth loading provider-specific skills at the orchestration layer whenever a chapter touches a vendor API, since the drafting agent may not have them.

## Evaluation notes (flywheel)

- Failure modes observed: (1) A subagent died on an expired auth token mid-research; the recovery that mattered was verifying the repo was clean before relaunching rather than assuming partial state. (2) An API option was used without its precondition — `strict: True` with no `additionalProperties: false` — which static prose review would not have caught and which no execution could catch either, since the example is `pending-env`. Exactly the class of defect the verification log's Chapter 2.2 story exists to warn about. (3) The 14-chapter denominator drift from 4.1 did not recur; the explicit guard in the brief held.
- Graders run and results (PASS/FAIL): build green PASS; documented-output-matches-execution PASS (re-verified independently); link integrity PASS; no-link-to-4.3 PASS; 4-part shape PASS; chapter-count invariant PASS (guard held); Anthropic model ID PASS; tool-use call surface PASS; strict-mode precondition FAIL → fixed.
- Prompt variant (if applicable): same draft-only brief shape as 4.1, plus an explicit instruction to load `claude-api` before writing model-facing code (which the subagent could not honor) and an explicit ban on installing an SDK or calling a model API (which it did honor — no repeat of 4.1's torch-download detour).
- Next experiment (smallest change to try): when a brief names a skill the subagent may not have, require it to report the gap *before* writing the affected code rather than after, so the orchestrator can supply the missing facts up front instead of auditing for them afterwards.
