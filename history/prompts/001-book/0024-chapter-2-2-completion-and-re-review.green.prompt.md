---
id: 0024
title: Chapter 2.2 completion and re-review
stage: green
date: 2026-08-15
surface: agent
model: claude-opus-5[1m]
feature: 001-book
branch: main
user: shahzaibkhan2625-tech
command: Finish the 4 open Chapter 2.2 fixes
labels: ["module-2", "chapter-2-2", "re-review", "code-verifier", "pose-publisher", "gazebo-harmonic", "ros2-jazzy", "verification-log"]
links:
  spec: specs/001-book/spec.md
  ticket: T017a
  adr: null
  pr: null
files:
  - book/docs/digital-twin/physics-gravity-collisions.mdx
  - specs/001-book/verification-log.md
tests:
  - "npm run build (book/): SUCCESS"
  - "compile() + ast.parse on both Chapter 2.2 Python blocks: 2/2 clean"
  - "xml.etree.ElementTree on all 5 Chapter 2.2 XML blocks: 5/5 well-formed"
  - "scale_inertia.py executed from a temp dir with the chapter's exact relative-path command: exit 0, stdout byte-identical to all 8 transcript lines"
  - "settle-window gate replayed at 50/60/100/120/250 Hz, old vs new: identical behaviour, SETTLED at 2.000 s"
  - "code-verifier re-review scoped to Chapter 2.2 only: 0 blockers, 3 majors, 5 minors"
---

## Prompt

Finish the 4 open Chapter 2.2 fixes you identified (do NOT touch other
chapters, do NOT re-review the whole module):
1. Fix the parameter_bridge command to bridge the same pose topic
   fall_probe.py subscribes to (/world/empty/model/simple_humanoid/pose).
2. Fix the timer to use the sim clock (add clock= / wall_clock as done in 2.1),
   and remove the now-unused import if not needed.
3. physics_lab.sdf: correct <sdf version> and the physics type to match the
   rest of the chapter.
4. Remove the /home/you/ placeholder in the scale_inertia.py transcript.
Then re-run code-verifier on Chapter 2.2 ONLY (its blocker was touched), apply
any remaining blocker/major, update verification-log.md, npm run build, and
write a short PHR.

Summary: the 4 fixes, verifier result on 2.2, build, confirm Module 2 now
fully reviewed.

## Response snapshot

All four fixes applied, then `code-verifier` re-run on Chapter 2.2 alone: **0 blockers**, 3 majors,
5 minors. The blocker from the module review is confirmed closed by an end-to-end source trace of
all ten hops — `<gazebo>` → SDF `<model>` (`parser_urdf.cc`), advertised topic
`/world/empty/model/simple_humanoid/pose` (`PosePublisher.cc:274` + `Util.cc`, confirming the
chapter's derivation), `Pose_V` advertisement, the legal `TFMessage`↔`Pose_V` pairing, per-pose
`frame_id`/`child_frame_id` written for every pose, `::`→`/` rewriting, and `short_name()` matching
both `'simple_humanoid'` and `'head'`.

**The open risk I flagged before dispatching turned out to be real and is now resolved.**
`fall_probe.py` derives every reported time from `transform.header.stamp`, and whether
`PosePublisher` stamps each per-pose header had never been confirmed — a second defect could have
been hiding behind the first. It does: `header->mutable_stamp()->CopyFrom(_stampMsg)` with
`_stampMsg = convert<msgs::Time>(_info.simTime)`. Also newly confirmed: link poses are stored
relative to the parent model for non-canonical links (`Physics.cc` `UpdateSim`), and `head` is
non-canonical while `base_link` is canonical — so the chapter's "head rel z" reading is valid and
invariant under a rigid topple, exactly as claimed.

**Two of the three new majors were introduced by my own completion pass**, recorded rather than
quietly fixed. Switching the timer to a steady wall clock made the surrounding prose wrong twice
over: the claim that `use_sim_time` keeps log timestamps on simulated time is false (`rcutils`
`logging.c` reads the system clock directly; `rcl` `logging_rosout.c` stamps `/rosout` from the same
value), and the claim that the parameter "matters more here than in Chapter 2.1" became inverted,
since nothing observable in this node now depends on it while 2.1's node printed
`self.get_clock().now()`. Both rewritten.

Three deviations from the instruction as literally written, each because the chapter's own content
forced it:

- **"Fix the timer to use the sim clock"** — the timer already used the sim clock by default
  fallback. The chapter's line 380 ("the probe will say it is waiting until you press Play") only
  holds with a wall clock, while the line after the code argued the opposite. Implemented the steady
  wall clock per "as done in 2.1", and rewrote the contradicting sentence.
- **The placeholder fix needed the command changed too.** The script echoes its output argument
  verbatim, so a bare `wrote humanoid_cad_units.urdf` would have been a lie while the command passed
  `~/humanoid/...`. Changed the invocation to `cd ~/humanoid` with relative paths, then executed it:
  stdout is now byte-identical to all eight transcript lines, closing the last caveat on Module 2's
  only `executed` example.
- **The topic change rippled into Exercise 4**, whose stated result still named
  `/world/physics_lab/pose/info`. Corrected to the pose publisher's path.

Left two minors unfixed and logged: `ElementTree` silently dropping a comment on round-trip
(cosmetic), and the `<gazebo>` mechanism now being explained in both 2.2 and 2.3 (FR-016 says the
second should be a cross-link, but 2.3 was out of scope this pass).

## Outcome

- ✅ Impact: Chapter 2.2's blocker closed and independently re-verified; 3 majors and 3 minors from
  the re-review applied. **Module 2 is now `drafted` in full and T017a is satisfied** — all four
  chapters plus the landing page through both reviewers, every blocker and major applied, 2.2
  additionally re-reviewed clean.
- 🧪 Tests: `npm run build` SUCCESS. 2/2 Python blocks compile, 5/5 XML well-formed,
  `scale_inertia.py` transcript byte-exact, settle-window replayed across five cadences.
- 📁 Files: `book/docs/digital-twin/physics-gravity-collisions.mdx`,
  `specs/001-book/verification-log.md`.
- 🔁 Next prompts: T018 (build + module ordering check), T019 (reconcile the log for Module 2,
  carrying the FR-016 `<gazebo>` cross-link item into 2.3), then T020/Module 3. T037 remains the
  real gate — Module 2 has 1 `executed` example out of 13.
- 🧠 Reflection: A fix pass that touches code can invalidate the prose that explains it. Two of the
  three new majors were prose that had been correct before my change and false after — worth
  treating "what did this edit make untrue?" as a standing check, not an afterthought. Separately,
  the reviewer's one quantitative claim (96/301 window checks failing) did not reproduce; verifying
  it before writing it into the log kept a wrong number out of the record.

## Evaluation notes (flywheel)

- Failure modes observed: (1) **Fixes that invalidate their own surrounding prose** — the timer
  change silently falsified two nearby sentences. (2) **A partially-applied fix that reads as
  complete** — the earlier session left `import rclpy.clock` with no call site, which looks fixed at
  a glance. (3) **An instruction containing a technical slip** ("use the sim clock" vs "as done in
  2.1") that only the chapter's own contradictory text could resolve. (4) **An unreproducible
  reviewer statistic** — reviewers are load-bearing but not infallible, and their numbers deserve
  the same re-derivation as the writer's.
- Graders run and results (PASS/FAIL): `npm run build` PASS; Python compile 2/2 PASS; XML 5/5 PASS;
  `scale_inertia.py` byte-exact transcript PASS; Chapter 2.2 re-review **PASS (0 blockers)**; T017a
  completion **PASS**.
- Prompt variant (if applicable): first use of a *scoped* re-review — one chapter, with the prior
  finding, the applied fix, and my own independent verifications supplied up front and an explicit
  "confirm or refute, don't just repeat" instruction. It returned three genuine new majors rather
  than re-litigating the closed blocker, which is the behaviour that scoping was meant to buy.
- Next experiment (smallest change to try): after any code edit inside a chapter, diff the
  surrounding two paragraphs against the change and ask what the edit made untrue — cheap, and it
  would have caught both self-inflicted majors before the reviewer did.
