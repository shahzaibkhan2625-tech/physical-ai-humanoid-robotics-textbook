---
id: 0015
title: Module 1 scaffold and Chapter 1.1
stage: green
date: 2026-08-10
surface: agent
model: claude-opus-5[1m]
feature: 001-book
branch: main
user: shahzaibkhan2625-tech
command: (direct prompt — Phase 3, tasks T006 and T007)
labels: ["book", "module-1", "chapter-1.1", "T006", "T007", "per-chapter-loop", "verification"]
links:
  spec: specs/001-book/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - book/docs/ros2/_category_.json
  - book/docs/ros2/index.mdx
  - book/docs/ros2/physical-ai-embodied-intelligence.mdx
  - book/docs/intro.mdx
  - specs/001-book/verification-log.md
tests:
  - npm run build (book/) — passed after T006 scaffold
  - npm run build (book/) — passed after Chapter 1.1 fix pass
  - Chapter 1.1 code example extracted from .mdx and executed on Python 3.14.2 — exit 0, stdout byte-identical to the chapter's stated output, deterministic across 3 runs
  - All 4 Chapter 1.1 exercises executed as variants by code-verifier; 2 overstated self-checks corrected
---

## Prompt

Phase 3: write Module 1 scaffold and Chapter 1.1, following
specs/001-book/tasks.md (T006, T007). Do only these two tasks, then stop for
my review before Chapter 1.2.

## T006 — Module 1 scaffold
Create the Module 1 folder under book/docs/ros2/ with:
- _category_.json (module label "Module 1 — ROS 2: The Robotic Nervous
  System", position so it sorts right after the intro)
- index.mdx (module landing page: what the module covers, prerequisites
  (Python yes, robotics no), what the reader can do at the end)

## T007 — Chapter 1.1
Use the chapter-writer subagent to write Chapter 1.1
"Introduction to Physical AI & Embodied Intelligence" at
book/docs/ros2/physical-ai-embodied-intelligence.mdx, applying the
chapter-authoring skill and the spec's Chapter Catalog entry for 1.1.

Then have code-verifier and consistency-checker review it independently
(in parallel — they're independent). Apply any blocker/major fixes with
chapter-writer. Chapter 1.1's code is plain Python (no ROS), so it CAN be
executed here — run it and record the result in verification-log.md.

## Constraints
- Follow the constitution and chapter-authoring skill exactly.
- Chapter 1.1 must have all 4 parts: objectives, theory, runnable code,
  exercises.
- Respect onBrokenLinks: 'throw' — no links to chapters that don't exist yet.
- Do NOT write Chapter 1.2 or beyond. Stop after 1.1 is done and reviewed.
- Run npm run build in book/ at the end — it must stay green.

## Summary at end
- Which files were created (and what each contains)
- What the writer produced (chapter structure, briefly)
- What each reviewer found, and what you fixed
- Code execution result + verification-log update
- Build result
- Confirm you stopped before 1.2

## Response snapshot

Executed T006 directly, then ran the full per-chapter loop for T007
(draft → parallel review → fix → independent execution → build).

**T006** — created `book/docs/ros2/_category_.json` (label "Module 1 — ROS 2: The
Robotic Nervous System", position 2, no other keys per the chapter-file contract) and
`book/docs/ros2/index.mdx` (`sidebar_position: 1`, module outcome, per-chapter preview,
Python-yes/robotics-no prerequisites, software and hardware baseline). Built green before
proceeding.

**T007 draft** — `chapter-writer` produced the chapter with the four required parts, a
single plain-Python sense–think–act example (a robot creeping toward a wall, reading a
noisy range sensor, with true position hidden from the decision function), and 4 exercises.
Zero internal links, deliberately: only `intro.mdx` and `ros2/index.mdx` exist and
`onBrokenLinks: 'throw'` is set.

**T007 review** — `code-verifier` and `consistency-checker` ran in parallel on the finished
draft. Combined: 0 blockers, 1 major, 10 minors.

The major was substantive. The walkthrough claimed "two centimetres of sensor error became
one centimetre of stopping error" and that the stopping reading "was low by a centimetre".
Instrumented, the reading was low by 3.0 mm; and re-running with the noise term zeroed
produced an identical result — for seed 7, sensor noise contributed nothing. The −0.010 m
error is discretization from the 0.03 m creep step stepping past the threshold. As written
the chapter taught readers to attribute a loop-rate error to sensor noise, which is the
diagnostic confusion its own four-properties framing exists to prevent.

**T007 fix** — applied the major plus 9 minors: two overstated exercise self-checks (seeds
1 and 3 give identical results, so "differ on every run" was false; the smooth-policy run
is 3.46× the cycles, not 3×), objective-3 wording that claimed loop-locality for the
sim-to-real gap, the word "Act" carrying two meanings between its definition and the
module-map table, unexpanded IMU/SLAM/pose for a no-robotics audience, a domain-randomization
passage reaching into Chapter 3.1's catalog scope, and the control-theory term "proportional"
in a chapter that excludes control theory. Two upstream one-line fixes followed the same
findings into `ros2/index.mdx` (previewed three hard properties where the chapter teaches
four) and `intro.mdx` ("actuators that lag" named a mechanism the chapter never covers).

Declined one finding: `consistency-checker` recommended amending the spec's Chapter Catalog
outcome line for 1.1 so the chapter's fourth learning objective becomes a mechanical SC-005
match. Editing ground truth to fit the artifact is the user's call, not the agent's — raised
for decision instead.

**Execution** — the code block was extracted programmatically from the `.mdx` and run on
Python 3.14.2: exit 0, stdout byte-identical to the chapter's printed output, deterministic
across three runs. Verified independently three times (writer, code-verifier, orchestrator
post-fix). `verification-log.md` row updated to record all three runs and the corrections.

**Build** — `npm run build` in `book/` green, no warnings, no broken links.

Stopped before Chapter 1.2 as instructed.

## Outcome

- ✅ Impact: Module 1 scaffold exists and Chapter 1.1 is complete through the full per-chapter loop — drafted, independently reviewed by both agents, all blocker/major findings fixed, code executed, build green. Chapter 1.1 is the first chapter to reach `verified` (1 of 14). The loop itself is now proven end-to-end on a real chapter, which was the stated point of doing Module 1 first.
- 🧪 Tests: 2 clean builds; 1 code example executed and byte-matched against its stated output, deterministic over 3 runs; 4 exercise variants executed, 2 corrections landed.
- 📁 Files: 3 created (`_category_.json`, `ros2/index.mdx`, `ros2/physical-ai-embodied-intelligence.mdx`), 2 modified (`intro.mdx` one clause, `verification-log.md` one row plus summary).
- 🔁 Next prompts: T008 (Chapter 1.2, ROS 2 architecture) after user review. Carry forward two recorded debts: 1.2 must link back to 1.1's multi-rate framing rather than re-deriving "a robot is many programs" for the fourth time, and four teaser sites in 1.1 need link backfill when 1.2/1.4/3.1/4.2 land.
- 🧠 Reflection: The reviewers earned their cost on this chapter. The major finding was invisible to reading — it required instrumenting the program and re-running it with the noise term zeroed. A review pass that only read the prose would have shipped a chapter that taught the wrong causal lesson in its headline example.
- 🚧 Open decision: whether to amend the spec's 1.1 catalog outcome line (see Evaluation notes).

## Evaluation notes (flywheel)

- Failure modes observed: (1) the writer's prose made a plausible causal claim about its own verified output that the output did not support — execution alone did not catch it, because the program ran correctly and printed exactly what the chapter said; only re-running a counterfactual did. (2) Two exercise self-checks were stated as absolutes ("differ on every run") that a reader following the instructions literally would falsify. (3) Scope leakage into a later chapter's catalog entry (domain randomization → 3.1) — invisible to a chapter-local review, caught only by checking against the catalog.
- Graders run and results (PASS/FAIL): chapter-file contract §7 items 1–10 — PASS. Constitution chapter quality gates — PASS. Code execution + byte-diff — PASS. Prose word count ~2,420 of a 2,500 ceiling — PASS, at the ceiling with no headroom.
- Prompt variant (if applicable): reviewers were briefed with explicit "do not report X as a finding" carve-outs (no rclpy in 1.1 by design; zero internal links by build constraint). This measurably reduced false positives — neither reviewer wasted a finding on either.
- Next experiment (smallest change to try): tell `code-verifier` explicitly to test causal claims counterfactually, not just to reproduce stated output. That single instruction is what surfaced the only major finding here, and it was luck that the brief's "any number the walkthrough quotes must match what actually ran" pushed it that way.
