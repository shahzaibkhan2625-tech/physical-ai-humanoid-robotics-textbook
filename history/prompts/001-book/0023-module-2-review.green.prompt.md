---
id: 0023
title: Module 2 review (T017a)
stage: green
date: 2026-08-15
surface: agent
model: claude-opus-5[1m]
feature: 001-book
branch: main
user: shahzaibkhan2625-tech
command: Module 2 review (task T017 / T017a)
labels: ["module-2", "review", "code-verifier", "consistency-checker", "gazebo-harmonic", "ros2-jazzy", "verification-log", "nfr-001"]
links:
  spec: specs/001-book/spec.md
  ticket: T017a
  adr: null
  pr: null
files:
  - book/docs/digital-twin/gazebo-setup-and-basics.mdx
  - book/docs/digital-twin/physics-gravity-collisions.mdx
  - book/docs/digital-twin/simulating-sensors.mdx
  - book/docs/digital-twin/unity-visualization.mdx
  - book/docs/digital-twin/index.mdx
  - specs/001-book/verification-log.md
  - specs/001-book/spec.md
  - specs/001-book/plan.md
  - specs/001-book/data-model.md
  - specs/001-book/tasks.md
  - .claude/skills/chapter-authoring/SKILL.md
  - .claude/agents/consistency-checker.md
tests:
  - "npm run build (book/) — baseline before any edit: SUCCESS"
  - "npm run build (book/) — after all review fixes: SUCCESS"
  - "python -m py_compile / compile() + ast.parse on all 5 Module 2 Python blocks: 5/5 exit 0"
  - "xml.etree.ElementTree on all 6 Module 2 XML/SDF blocks: 6/6 well-formed (one legitimate multi-root fragment parses wrapped and as assembled)"
  - "csc.exe on JointStateReceiver.cs against stubs for UnityEngine / Unity.Robotics.ROSTCPConnector / RosMessageTypes.Sensor: exit 0"
  - "scale_inertia.py executed against Chapter 1.4's real simple_humanoid.urdf: exit 0, six inertia values match transcript byte-for-byte"
---

## Prompt

Module 2 review (task T017 / T017a). All four Module 2 chapters are drafted:
2.1 gazebo-setup-and-basics, 2.2 physics-gravity-collisions, 2.3
simulating-sensors, 2.4 unity-visualization (in book/docs/digital-twin/).

Run the per-module review now:
1. code-verifier across all four chapters: static-check every code block and
   command — syntax, real-vs-invented APIs/SDF/gz tags, correct Gazebo
   Harmonic + ROS 2 Jazzy usage, environment stated. Report per chapter.
2. consistency-checker across all four: terminology consistent across the
   module and with Module 1, cross-links resolve, the Chapter 1.4 humanoid is
   reused consistently, 4-part shape present, no repetition/forward-refs.
3. Also backfill Chapter 2.1's missing verification-log rows (the T017a gap
   noted earlier).
4. Apply blocker/major fixes with chapter-writer. Log everything in
   verification-log.md.
5. Run npm run build — must stay green.
6. Write the PHR.

## Summary at end
- What each reviewer found, per chapter (blockers/majors/minors)
- What you fixed
- verification-log state (including 2.1 backfill)
- Build result
- Confirm Module 2 is now fully reviewed

---

**Follow-up prompt, after the session hit its usage limit mid-fix:**

The Module 2 review is done and its fixes are on disk, but two things were
left unfinished when the session limited out: the verification-log.md update
(including the Chapter 2.1 backfill) and the review PHR.

Finish only those now — do NOT re-review or change chapter content:
1. Update specs/001-book/verification-log.md: backfill Chapter 2.1's rows, and
   log all Module 2 code/commands with correct status (executed vs pending-env),
   reflecting the review's findings.
2. Write the Module 2 review PHR.
3. Run npm run build to confirm still green.

Summary: verification-log state, PHR file created, build result.

## Response snapshot

Ran both reviewers together in fresh contexts across all four chapters plus `index.mdx`, as plan
D4 requires. Totals: `code-verifier` 1 blocker / 6 majors / 12 minors; `consistency-checker`
0 blockers / 6 majors / 8 minors.

**The blocker — Chapter 2.2's `fall_probe.py` could not have produced any of its documented
output.** The node subscribed `/world/empty/pose/info` and filtered transforms on
`short_name(transform.child_frame_id)`. Two facts, traced through shipping source and
**re-verified independently by the orchestrator before any fix was applied**, make that impossible:

- `gz-sim8` `src/systems/scene_broadcaster/SceneBroadcaster.cc` fills each pose with only
  `msgs::Set(...)`, `set_name(...)`, `set_id(...)`, and sets `mutable_header()` on the *enclosing*
  `Pose_V` only — never per pose.
- `ros_gz@jazzy` `src/convert/geometry_msgs.cpp` reads `child_frame_id` **exclusively** from
  per-pose `header().data()` key-value pairs and never touches `pose.name()`.

So every bridged transform arrives with empty `frame_id`, empty `child_frame_id` and a zero stamp;
every message was skipped; the node's only reachable output was a warning. Chapter 2.1's Exercise 4
taught the same misconception and was rewritten with it. Fix: attach `gz-sim-pose-publisher-system`,
which *does* populate those pairs (`PosePublisher.cc`), and whose `::`→`/` rewriting makes the
node's existing `short_name()` work unchanged.

**Second correctness class, Chapter 2.1: sim-clock timers that never fire.** `create_timer(period,
cb)` falls back to the node's ROS clock (`rclpy@jazzy` `node.py`). Under `use_sim_time:=true` that
clock freezes with sim time, so Exercise 1's "pause Gazebo and watch three report lines" produced
no output at all, and the `no /clock messages yet` warning the chapter told readers to look for was
unreachable. Fixed with an explicit `STEADY_TIME` clock; `create_timer`'s `clock=` keyword was
confirmed in the Jazzy signature first.

**Chapter 2.3, a fix that prevented a wild-goose chase:** the expected `gz topic -l` listing was
wrong twice over — `camera_info` is a *sibling* of the sensor topic, not a child
(`CameraSensor::AdvertiseInfo()` pops the last path segment), and `/humanoid/scan/points` was
missing entirely (`GpuLidarSensor::Load` always advertises it). The chapter told readers a mismatch
meant the sensors had failed to load.

**Escalated rather than decided unilaterally:** all four chapters ran 3,300–4,200 prose words
against NFR-001's 1,200–2,500 band, and the spec says an over-budget chapter "must be split." The
user chose to widen the band for Modules 2–4 to 1,200–4,500 rather than cut prose or split the
catalog. Applied consistently across `spec.md` (NFR-001 + SC-006), `plan.md` (constraints +
constitution-check table), `data-model.md`, the `chapter-authoring` skill and the
`consistency-checker` agent definition, with the rationale recorded in the NFR so it is not
re-litigated next review.

**Reported honestly rather than as clean:** both `chapter-writer` agents were killed by the session
limit mid-edit. Three of four chapters plus the landing page completed; **Chapter 2.2 is partially
fixed and internally inconsistent** — its bridge command still names the old topic while the node
names the new one, and its report timer never received the `clock=` argument its now-unused import
was added for. Verified the actual on-disk state by inspection rather than trusting the "fixes are
on disk" premise, and logged the four open items explicitly instead of recording 2.2 as reviewed.

## Outcome

- ✅ Impact: Module 2 reviewed end-to-end by both agents. One blocker and eleven majors found; all
  fixes applied to Chapters 2.1, 2.3, 2.4 and the landing page. `verification-log.md` rewritten —
  Chapter 2.1's three-row backfill closes the gap the file itself had flagged, and Modules 2's full
  set is now logged at 23 examples (4 `executed`, 19 `pending-env`, 0 `blocked`). NFR-001 amended by
  user decision. **Module 2 is not fully reviewed: Chapter 2.2 has four open items, two of them
  correctness defects.**
- 🧪 Tests: `npm run build` green before and after. All 5 Python blocks compile; all 6 XML/SDF blocks
  well-formed; the C# compiles under `csc`; `scale_inertia.py` re-executed and matches its transcript.
- 📁 Files: 5 chapter/landing files, `verification-log.md`, 4 spec-side documents, 2 agent/skill
  definitions.
- 🔁 Next prompts: close Chapter 2.2's four outstanding items (bridge topic, timer `clock=`,
  `physics_lab.sdf` version/type, `/home/you/` placeholder); then re-run `code-verifier` on 2.2 only,
  per T017a's "re-review any chapter whose blocker was fixed"; then T018 (build + ordering) and T019.
- 🧠 Reflection: The blocker was invisible to prose review and to syntax checking — the code compiles
  cleanly and reads correctly. It only fell out of tracing two repositories to see what actually
  populates a field. That is the strongest argument yet for standing up `ubuntu-24.04-gui` at T037
  sooner rather than later: one execution would have caught in ten seconds what took a two-repository
  source trace to find.

## Evaluation notes (flywheel)

- Failure modes observed: (1) **Plausible-but-unpopulated message fields** — the drafted code
  assumed `Pose_V` entries carry frame names because they carry a `name`, which is exactly the kind
  of gap static checking and prose review both pass over. (2) **Anticipatory edits left dangling** —
  the killed writer added `import rclpy.clock` before making the call site use it, leaving an unused
  import and an unfixed bug that reads as fixed at a glance. (3) **A premise in the follow-up prompt
  that did not hold** — "fixes are on disk" was true only for three of four chapters; verifying
  before logging was what caught it. (4) Reviewers disagreed on nothing factual, but both
  independently flagged the `joint_state_publisher` vs `joint_state_publisher_gui` slip, which
  suggests it is a genuinely easy one to make.
- Graders run and results (PASS/FAIL): `npm run build` PASS (baseline + final); Python compile 5/5
  PASS; XML well-formedness 6/6 PASS; C# compile PASS; `scale_inertia.py` transcript match PASS;
  T017a completion **FAIL** — Chapter 2.2's blocker is not fully closed.
- Prompt variant (if applicable): first use of the batched per-module review (plan D4) on a module
  whose chapters were drafted separately. Running both reviewers concurrently and splitting the
  writers by disjoint file sets worked well; the split meant one writer's death cost only one
  chapter.
- Next experiment (smallest change to try): have `chapter-writer` make the call-site edit before the
  import, so a killed agent leaves a syntactically obvious break rather than a silently unfixed bug —
  and give module-review writers an explicit "if you are running low, stop at a consistent state and
  report what remains" instruction.
