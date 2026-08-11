---
id: 0020
title: Per-module review workflow change
stage: plan
date: 2026-08-11
surface: agent
model: claude-opus-5[1m]
feature: 001-book
branch: main
user: shahzaibkhan2625-tech
command: (direct prompt)
labels: ["process-change", "review-workflow", "plan", "tasks", "usage-limits"]
links:
  spec: specs/001-book/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-book/plan.md (modified — Summary point 2, D4 rewritten)
 - specs/001-book/tasks.md (modified — loop section, Phases 3–6, dependencies, notes)
tests:
 - none (documentation-only change; no chapter content or build inputs touched)
 - verified via `git status --short` that only plan.md and tasks.md are modified
---

## Prompt

Before starting Module 2, update the plan and tasks to record a deliberate
process change. Do NOT change any chapter content — only plan.md and tasks.md.

## The change
Review now runs ONCE PER MODULE (after that module's chapters are drafted),
not per chapter. Reason: token/usage constraints — running both reviewers on
every chapter was exhausting session limits.

- Per chapter: chapter-writer drafts + self-checks against the skill; build
  stays green.
- Per module (after all its chapters are drafted): code-verifier and
  consistency-checker run once across the whole module, then fixes are applied.
- Exception already done: Module 1 and Chapter 1.4 were reviewed per-chapter.
  Module 1 keeps its per-chapter review; the new model starts at Module 2.

## Tasks to update
- specs/001-book/plan.md: record the per-module review workflow and the reason.
- specs/001-book/tasks.md: for Modules 2, 3, 4, restructure so each chapter's
  task is "draft + build-green", and add one "module review" task per module
  (code-verifier + consistency-checker + fixes) after its chapters.
- Keep all quality gates identical — only WHEN review runs changes, not WHETHER.

Write a PHR. Then summarize: what changed in plan.md and tasks.md, and confirm
no chapter content was touched.

## Response snapshot

Recorded the process change in both planning artifacts, touching no content under `book/docs/`.

**plan.md**

- Summary point 2 restated: drafting per chapter, review batched per module, with the usage-limit
  reason named and a pointer to D4.
- D4 renamed from "Per-chapter authoring pipeline" to "Draft per chapter, review per module" and
  rewritten as two per-chapter steps (draft with self-check against the `chapter-authoring` skill;
  build green) plus three per-module steps (parallel `code-verifier` + `consistency-checker` scoped
  to the whole module; apply blockers/majors; re-review changed chapters if a blocker was fixed).
- D4 gained four explicit subsections: **why** review is batched (8 → 2 reviewer invocations for a
  four-chapter module), **what this does not change** (every gate identical, only timing moved),
  **the cost** (a defect in chapter N can propagate to N+1… before any reviewer sees it, contained
  by the writer's self-check and catalog-order drafting), and the **Module 1 exception**.

**tasks.md**

- "The per-chapter loop" section replaced by "The authoring loop — draft per chapter, review per
  module", with the reason, the 2-step chapter flow, the 3-step module flow, and the Module 1
  exception.
- Phase 3 (Module 1) gained a "Review model — historical exception" note; its chapter tasks are
  unchanged and it has no module-review task.
- Modules 2, 3, 4: every chapter task's "Run the per-chapter loop" became **"Draft + build green"**
  (T014–T017, T022–T024, T028–T030).
- Three new review tasks inserted in place: **T017a** (Module 2), **T024a** (Module 3, noting
  `code-verifier` carries extra weight where GPU execution is unavailable), **T030a** (Module 4,
  noting the capstone must cite teaching chapters and introduce nothing new). Letter suffixes were
  used deliberately so no existing task ID shifts — T018–T038 keep their numbers and every
  cross-reference in the dependency table stays valid.
- Phase dependencies: module review depends on all chapter tasks in its phase and blocks that
  phase's checkpoint; a module is not `drafted` until review has run and blockers/majors are fixed.
- Parallel-opportunities section retargeted from "within a chapter task" to "within the module
  review task", naming T017a/T024a/T030a.
- "Parallel Example" rewritten as one module drafted then reviewed.
- "Two things that will bite" → three, adding: the module review is not skippable, and carrying it
  into the next module turns four unreviewed chapters into eight.
- Task count updated: 38 → 41 (US2 7→8, US3 7→8, US4 6→7), with a line recording the 3 module
  review tasks and Module 1's absence from them.

## Outcome

- ✅ Impact: The per-module review model is now the recorded workflow for Modules 2–4, with its
  rationale, its accepted cost, and Module 1's exception all written down rather than remembered.
  Quality gates are unchanged in substance.
- 🧪 Tests: None applicable — planning artifacts only. `git status --short` shows exactly two
  modified files: `specs/001-book/plan.md`, `specs/001-book/tasks.md`.
- 📁 Files: 2 modified, 0 created under `book/docs/`, 0 chapter files touched.
- 🔁 Next prompts: T013 (scaffold `book/docs/digital-twin/`), then T014–T017 draft Module 2's four
  chapters, then T017a module review.
- 🧠 Reflection: Letter-suffixed task IDs (T017a) kept the diff to the three phases that changed
  instead of renumbering 21 downstream tasks and every reference to them. The trade-off D4 now
  names — deferred review lets defects propagate across a module — is the real cost of this change
  and was worth stating in the plan rather than discovering mid-module.

## Evaluation notes (flywheel)

- Failure modes observed: The previous per-chapter review model exhausted session token/usage
  limits before a module could be completed — two reviewer agents × 4 chapters per module, each in
  fresh context re-reading surrounding chapters.
- Graders run and results (PASS/FAIL): PASS — scope respected (no `book/docs/` edits); PASS — all
  gates preserved, only timing changed; PASS — Module 1 exception recorded in both files.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): Run Module 2 end to end under the new model and compare
  the module review's blocker/major count against Module 1's per-chapter totals. If deferred review
  produces materially more cross-chapter rework, consider an intermediate model — review at the
  module's halfway point as well as its end.
