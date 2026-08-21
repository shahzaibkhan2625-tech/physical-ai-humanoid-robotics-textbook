---
id: 0029
title: Modules 3 and 4 final review — partial, blocked by session limit
stage: misc
date: 2026-08-21
surface: cli
model: claude-opus-5
feature: 001-book
branch: main
user: shahzaibkhan2625-tech
command: (none — direct prompt)
labels: [review, T024a, T030a, T026, T032, verification-log, blocked]
links:
  spec: specs/001-book/spec.md
  ticket: T024a / T030a (module reviews), T026 / T032 (log reconcile)
  adr: n/a
  pr: n/a
files:
  - specs/001-book/verification-log.md
tests:
  - "npm run build (book/): SUCCESS, no errors or warnings"
  - "py -3.12 -m py_compile on all 11 extracted Python blocks: rc=0 each"
  - "py -3.12 check_support_polygon.py: exit 0, stdout matches chapter transcript line-for-line"
  - "py -3.12 voice_intent.py: exit 0, all 8 cases as documented"
  - "py -3.12 mission_trace.py: exit 0, all 5 missions trace as documented"
  - "py -3.12 pose_report.py: FileNotFoundError('pose_log.jsonl') — correct, input is blocked upstream"
---

## Prompt

Final review — Modules 3 and 4. Both reviewers (code-verifier + consistency-checker) across all 6 chapters:
Module 3: isaac-sim-synthetic-data, isaac-ros-visual-slam, nav2-path-planning
Module 4: voice-to-action-whisper, cognitive-planning-llms, capstone-autonomous-humanoid

1. code-verifier: static-check all code — syntax, real APIs, correct Jazzy idiom, environment stated. For GPU-blocked chapters, verify what's verifiable (syntax, API existence, imports).
2. consistency-checker: terminology consistent across all 4 modules, cross-links resolve, 4-part shape, no repetition, single humanoid model respected.
3. Backfill any missing verification-log rows for Module 3 and 4.
4. Apply blocker/major fixes with chapter-writer.
5. npm run build — green.
6. Write PHR.

Summary: findings per chapter (blockers/majors/minors), fixes applied, verification-log state, build result, confirm all 14 chapters reviewed.

## Response snapshot

**Partially completed. Items 1 and 4 are incomplete because the Anthropic session limit was
reached mid-review; this PHR records the real state rather than a clean one.**

Eight agents were launched in parallel (six `code-verifier`, one per chapter; two
`consistency-checker`, one per module). **Three completed. Five failed** — `code-verifier` on
3.2, 3.3 and 4.1 hit the session limit (resets 1:10pm Asia/Karachi); `code-verifier` on 3.1 and
4.3 died to stalled streams. No fixes were applied, because `chapter-writer` cannot run under the
same limit.

### What completed

| Reviewer | Scope | Blockers | Majors | Minors |
|---|---|---|---|---|
| `consistency-checker` | Module 3 (3 chapters + landing) | 1 | 8 | 6 |
| `consistency-checker` | Module 4 (3 chapters + landing) | 1 | 4 | 7 |
| `code-verifier` | Chapter 4.2 only | 2 | 1 | 3 |

**Three blockers, all independently re-verified by the orchestrator against primary sources
before being recorded** — the discipline the Module 2 review established:

1. **Ch 3.3 contradicts Ch 2.2 on the humanoid's support polygon.** `check_support_polygon.py`
   drops the `0.04 m` forward offset on the foot collision box. Confirmed at source:
   `urdf-describing-a-humanoid.mdx` defines both feet with `<origin xyz="0.04 0 -0.03">`, and
   Ch 2.2 derives x ∈ [−0.070, +0.150] from it and builds a margins table on the resulting
   asymmetry. Ch 3.3 computes x ∈ [−0.11, +0.11]. Symptom: scenario 4 prints `FALLING` for a COM
   at x = 0.14 that is inside the real polygon. The code is self-consistent — executed here, and
   its stdout matches the chapter's transcript line-for-line — so only a cross-chapter check
   could catch this.
2. **Ch 4.3's run recipe cannot produce the topics it bridges.** Terminals 1/1b use `empty.sdf` +
   `simple_humanoid.urdf`; terminal 2 then bridges `/humanoid/scan`, `/humanoid/depth`,
   `/humanoid/imu`. Confirmed against Ch 2.3, which states outright that `empty.sdf` loads neither
   `gz-sim-sensors-system` nor `gz-sim-imu-system`, and which uses `sensor_world.sdf` +
   `sensor_humanoid.urdf`. The bridge starts cleanly and publishes nothing — the failure 2.3
   itself calls "the most confusing possible failure".
3. **Ch 4.2's replanning loop 400s on attempt 2.** It appends the assistant `tool_use` turn then a
   plain-string user message with no `tool_result`. Confirmed against the `claude-api` skill,
   which the failing agent could not load: *"Tool result blocks must immediately follow their
   corresponding tool use blocks… You cannot include any messages between."* This kills the
   chapter's headline safety mechanism and makes one of its two transcripts unreachable.

Other confirmed findings of note: Ch 3.1 claims Gazebo "can optionally use" PhysX (Ch 2.2
enumerates DART and bullet-featherstone; `gz-physics` ships no PhysX plugin); Ch 3.2 reports pose
in `odom` while Ch 3.3 consumes `map`, a convention no chapter introduces; Ch 4.3's
`EMBODIED_SKILL_REGISTRY` was read back at runtime as `['walk_to', 'say']`, so the `STOP` direct-
command path it traces as `[succeeded]` has no subscriber and no grounding.

### What was done anyway

- **Local code verification** substituting for the mechanical half of the five dead agents: all 11
  Python blocks extracted programmatically and `py_compile`-clean under 3.12; the four stdlib-only
  examples executed. Three run clean and match their transcripts; the fourth fails with
  `FileNotFoundError` on an input its blocked upstream example would produce — correct behaviour.
- **Verification log backfilled** (items 3 / T026 / T032). Eight rows added — 3.1 ×2, 3.2 ×2,
  3.3 ×2, 4.3 ×2 — closing the gap where the table jumped from 2.4 straight to 4.1. Totals moved
  27→35 examples, 6→8 `executed`, 21→25 `pending-env`, and **0→2 `blocked`**.
- **`blocked` is non-zero for the first time.** Per T026, Isaac examples needing an RTX GPU are
  `blocked`, not `pending-env`: no scheduled resolution, no T037 date. SC-003 cannot be met for
  Chapters 3.1 and 3.2 without a hardware decision. Each row states what remains unverified.
- **`npm run build`: green**, before and after. No `book/docs/` file was modified.

### What is NOT done

- **Code verification for 3.1, 3.2, 3.3, 4.1, 4.3** beyond syntax and execution. The highest-risk
  open question is Ch 3.2's Isaac ROS release line — research R3 records `release-4.5` as
  Jazzy-targeting, but Isaac ROS 3.x targets Humble and this was not re-confirmed upstream.
  Also open: Replicator API surface (3.1), Nav2-on-Jazzy plugin/parameter names (3.3), Whisper
  re-verification (4.1), capstone cross-chapter contract audit (4.3).
- **No fixes applied.** All three blockers and ~13 majors are open. Deliberately not applied by
  hand: five of six chapters have no code review yet, so editing now would mean re-reviewing
  already-modified text and risks churn against defects still unknown.
- **T024a / T030a are not satisfied.** Both require `code-verifier` and `consistency-checker` to
  run together across the module; only the consistency half ran for Modules 3 and 4.
- **"All 14 chapters reviewed" cannot be confirmed.** 14/14 are drafted and the site builds;
  6 of 14 have had both reviewers complete (Modules 1–2 plus 4.2).

### Follow-ups

- Re-run the five failed `code-verifier` agents after the limit resets, one or two at a time
  rather than six at once — the parallel fan-out is what exhausted the budget.
- Then apply blockers + majors with `chapter-writer`, and re-review any chapter whose blocker was
  fixed (the T017a rule that caught the Ch 2.2 regression).
- Two findings are book-wide and must not be fixed inside Modules 3–4 alone: the `Status:`
  execution-convention split (Modules 3–4 use it, 1–2 do not), and Ch 1.1's "position estimate"
  vs Ch 3.2's "pose estimate". Both belong to T033/T034.
