---
id: 0018
title: Chapter 1.4 URDF humanoid model
stage: green
date: 2026-08-11
surface: agent
model: claude-opus-5[1m]
feature: 001-book
branch: main
user: shahzaibkhan2625-tech
command: (direct prompt — Phase 3, task T010)
labels: ["book", "module-1", "chapter-1.4", "T010", "per-chapter-loop", "urdf", "FR-017", "executed", "pending-env", "module-1-complete"]
links:
  spec: specs/001-book/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - book/docs/ros2/urdf-describing-a-humanoid.mdx
  - book/docs/ros2/physical-ai-embodied-intelligence.mdx
  - book/docs/ros2/index.mdx
  - book/docs/intro.mdx
  - specs/001-book/verification-log.md
tests:
  - npm run build (book/) — passed, run by the orchestrator after the fix pass
  - urdf_tree.py EXECUTED on Python 3.14.2, 4 independent runs; stdout matches the printed transcript exactly (newline-normalized)
  - simple_humanoid.urdf EXECUTED through xml.etree.ElementTree — 13 links, 12 joints, 1 root, no cycles, all limits present
  - All 39 inertia components recomputed against rigid-body formulas — all correct to printed precision
  - All 3 exercise mutations executed and reproducing their stated results exactly
  - check_urdf, ros2 launch, RViz — pending-env, not executed (no Ubuntu/ROS 2 on the authoring machine)
  - Prose 2,456 words — inside the NFR-001 band of 1,200–2,500 (was 2,530, over)
---

## Prompt

Chapter 1.4's draft is complete on disk at
book/docs/ros2/urdf-describing-a-humanoid.mdx. Do NOT rewrite it. Continue
from where it stopped — review, verify, fix, log, build:

1. Run code-verifier and consistency-checker on the existing draft, in
   parallel, independently.
   - code-verifier: validate the URDF (well-formed XML, single root, joint
     tree, inertia tensors match the shape/mass formulas), and check the
     Python loader script. The stdlib-only Python (xml.etree, no ROS) CAN run
     here — execute it and confirm it reports the joint tree correctly.
   - Anything needing ROS tools (check_urdf, robot_state_publisher) is
     pending-env.
   - consistency-checker: verify the 13-link justification paragraph is
     present, cross-links to 1.1-1.3 are correct, terminology consistent,
     4-part chapter shape.
2. Apply any blocker/major fixes with chapter-writer.
3. Update verification-log.md: the stdlib Python script as executed, any
   ROS-dependent parts as pending-env.
4. Run npm run build in book/ — must stay green.
5. Write the PHR. Stop before T011.

Summary: what each reviewer found + fixes, the humanoid model's link/joint
structure, what ran (executed) vs pending-env, build result, confirm Module 1
is now complete (4 chapters + landing page).

---

(Follow-up, after `code-verifier` died mid-investigation on a session limit:)

Chapter 1.4 review is already done (both reviewers ran). The draft is complete
on disk. Do NOT rewrite it and do NOT re-review. Just finish T010:

1. Apply the blocker/major fixes the reviewers found, using chapter-writer.
2. Execute the stdlib-only Python loader script and confirm it reports the
   joint tree; log it as executed in verification-log.md. Log any ROS-dependent
   parts as pending-env.
3. Run npm run build in book/ — must stay green.
4. Write the PHR. Stop before T011.

Summary: what fixes were applied, what ran (executed) vs pending-env, build
result, confirm Module 1 is complete (4 chapters + landing).

## Response snapshot

**Reviews**, run in parallel on the existing draft: **5 major, 12 minor, 6 nits, 0 blockers.**

`code-verifier` found the technical core unusually solid and said so with numbers: all **39
inertia components** recomputed from mass and shape and correct to the printed precision; roughly
60 numeric claims re-derived (total mass, heights, both exercises' arithmetic) with zero errors;
the three inline XML excerpts byte-identical to the full listing; `urdf_tree.py` producing output
matching its printed transcript exactly. Its two majors were both in the *tooling around* the
model: the claim that all three visualization packages ship in `ros-jazzy-desktop` is **false**
(`joint_state_publisher` appears in none of the six `ros2/variants@jazzy` variants), and the
launch file's `/home/you/` placeholder path violates the spec's own "no placeholder values"
acceptance criterion.

`consistency-checker` found three majors of a different kind. Two were **defects 1.4's existence
created in already-shipped chapters**: 1.1 claims its example is "the only example in this module
with no ROS 2 dependency" and the landing page says "the remaining three need a working ROS 2
Jazzy installation" — both now false, since the URDF and the tree script need neither. The third
was that the launch file makes deferred Module 2 material a de facto prerequisite (FR-016), and
the spec's Chapter Catalog independently confirms it: 1.4 is budgeted **two** code examples, and
the launch file is an unbudgeted third.

**A third major came from measurement, not from either reviewer.** Counting prose against NFR-001
put the chapter at **2,530 words** against a 1,200–2,500 band, and above all three siblings.
`consistency-checker` reached the same conclusion by a rougher line-extrapolation (~2,850).

**The refuted fix.** `consistency-checker`'s preferred remedy for the launch file was to replace
it with `ros2 run --ros-args -p robot_description:="$(cat …)"`. Rather than assume the common
tutorial idiom works, `code-verifier` was asked to trace the `-p` parsing path. It came back
**decisive: libyaml rejects the multi-line XML** — then died on a session limit before finishing.
That single partial answer changed the plan: the launch file was **kept and explained** rather
than removed, and its verified `ParameterValue(Command(...), value_type=str)` form was left
untouched (`value_type` is load-bearing; without it the URDF is YAML-parsed and fails).

**Fixes** — all 5 majors and all 18 minors/nits applied by `chapter-writer` under a costed word
budget, since the mandated additions (~120 words) had to be paid for before any could land. Prose
went **2,530 → 2,456**, in band and level with its siblings (2,381 / 2,400 / 2,320). Two prose
corrections mattered beyond wording: "three checks run first" was false (only two run and return
1; `reached` is printed but never compared, so a broken tree exits 0), and "RViz opens with no
displays configured" was false (`default.rviz` ships a Grid and a `/map` Fixed Frame). Both were
fixed as **prose**, leaving `urdf_tree.py`'s code — and therefore its executed transcript —
untouched.

**Verification** — the orchestrator re-extracted every fenced block from the *final shipped file*
and re-ran it: URDF parses to 13 links / 12 joints / one root / no cycles / no duplicate names,
all 12 revolute joints carrying `effort` and `velocity`, 34.700 kg; `urdf_tree.py` exits 0 with
output matching the printed transcript exactly once CRLF is normalized (the verifier's
"byte-identical" claim holds modulo Windows line endings, which is now stated precisely in the
log rather than repeated unqualified).

**Log** — four new rows: two `executed`, two `pending-env`. Log now 11 examples, 3 `executed`,
8 `pending-env`.

**Build** — green.

Stopped before T011.

## Outcome

- ✅ Impact: Chapter 1.4 is `drafted`, and **Module 1 is complete** — 4 chapters plus the landing page. It produces the single humanoid model required by FR-017 that T014–T017, T022–T024 and T030 all depend on, and it is the closest of the four to `verified`: both of its *chapter* examples are executed, covering every numeric claim the chapter makes about the robot. What remains pending is tooling around the model, not the model.
- 🧪 Tests: 1 clean build; 2 of 4 examples executed (4 independent runs of the loader, 3 exercise mutations, 39 inertia recomputations); 2 pending-env; 0 claims left unverified by either reviewer.
- 📁 Files: 1 created (`urdf-describing-a-humanoid.mdx`), 4 modified (`physical-ai-embodied-intelligence.mdx`, `ros2/index.mdx`, `intro.mdx`, `verification-log.md`).
- 🔁 Next prompts: T011 (Module 1 build + sidebar ordering check — `sidebar_position` already verified 1→5 with no filename-sort dependency), then T012 (log reconciliation) closes Phase 3. Module 2 (T013+) must not start before that checkpoint.
- 🧠 Reflection: The most valuable single action was refusing to accept a plausible fix on reputation. `ros2 run --ros-args -p robot_description:="$(cat …)"` appears throughout ROS tutorials and both the reviewer and the orchestrator expected it to work; one targeted source trace refuted it. Had it been applied unverified, the chapter would have shipped a headline instruction that fails on the reader's first attempt — the exact defect class the whole review loop exists to catch.
- 🚧 Open decision: `consistency-checker` recommends amending the landing page and intro's "torso, head, two arms, two legs" to match the thirteen-link model. This was applied. It also notes the model articulates in the sagittal plane only (every leg joint is `axis 0 1 0`), which a reader reaching Module 2.2 expecting a balanceable biped will discover; a 28-word caveat was added, but whether Module 2 needs a fuller treatment is deferred.

## Evaluation notes (flywheel)

- Failure modes observed: (1) **A new chapter silently falsifying claims in already-shipped chapters** — 1.4's ROS-free examples made two statements in 1.1 and the landing page wrong. No per-chapter review catches this by construction; only a reviewer explicitly pointed at the *rest of the book* found it. (2) **A reviewer's recommended fix being wrong** — the `ros2 run` replacement was refuted only because it was checked. (3) A false prose claim sitting next to correct code, for the third chapter running ("three checks run first"); the code was right and only the prose wrong, exactly as in 1.3. (4) A word-budget breach that neither reviewer was briefed to measure and that only independent counting surfaced.
- Graders run and results (PASS/FAIL): chapter-file contract §7 items 1–10 — PASS. Constitution chapter quality gates — PASS except "every example executed", which FAILS for 2 of 4 by environment and is recorded. Objectives vs catalog — PASS after F1 restored the catalog's "simpler than" wording. Prose in band — PASS at 2,456 after FAIL at 2,530. FR-016 no-forward-reference — PASS after the launch file was explained rather than removed.
- Prompt variant (if applicable): the fix brief carried a **hard word budget with the measuring script named**, and pre-resolved every finding into an exact instruction rather than forwarding two review reports. The budget held (2,456, inside the 2,400–2,460 target). This directly addresses 0017's "next experiment", which was to cost fix-pass additions before applying them rather than discovering the breach afterwards.
- Next experiment (smallest change to try): give `consistency-checker` an explicit instruction to check whether the *new* chapter falsifies claims in *previously shipped* chapters, and to grep the earlier files for superlatives ("the only", "the remaining three", "every other") that a new chapter could invalidate. Failure mode (1) was found by luck of thoroughness, not by the brief.
