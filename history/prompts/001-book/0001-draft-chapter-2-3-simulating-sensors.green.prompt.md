---
id: 0001
title: Draft Chapter 2.3 Simulating Sensors
stage: green
date: 2026-08-15
surface: agent
model: claude-opus-5[1m]
feature: 001-book
branch: main
user: shahzaibkhan2625-tech
command: (direct request — chapter-writer subagent dispatch)
labels: ["module-2", "chapter-2.3", "sensors", "gazebo", "ros2-jazzy", "draft-only"]
links:
  spec: specs/001-book/spec.md#23-simulating-sensors-lidar-depth-cameras-imu
  ticket: specs/001-book/tasks.md#T016
  adr: null
  pr: null
files:
 - book/docs/digital-twin/simulating-sensors.mdx (created, 789 lines)
 - history/prompts/001-book/0001-draft-chapter-2-3-simulating-sensors.green.prompt.md (created)
tests:
 - npm run build (book/) — SUCCESS, run independently after the subagent reported
 - Cross-link audit — all 9 relative links resolve to existing pages (onBrokenLinks: 'throw')
 - Chapter code examples — NOT executed; require Ubuntu 24.04 + ROS 2 Jazzy + Gazebo Harmonic + GPU (pending-env)
 - sensor_probe.py — py_compile passes; callbacks exercised against stubbed rclpy/sensor_msgs with synthetic messages
---

## Prompt

Module 2, Chapter 2.3 — DRAFT ONLY. Do NOT run reviewers (they run at the
Module 2 review after 2.4). Follow specs/001-book/tasks.md.

## Chapter 2.3
Use the chapter-writer subagent to write Chapter 2.3
"Simulating Sensors: LiDAR, Depth Cameras, IMU" at
book/docs/digital-twin/simulating-sensors.mdx (per spec's Chapter Catalog
entry for 2.3), applying the chapter-authoring skill.

Key requirements:
- Teach: how a simulator generates sensor data — LiDAR (ray casting), depth
  cameras (per-pixel distance), IMU (acceleration + angular velocity); how
  these attach to the Chapter 1.4 humanoid; how sensor data flows into ROS 2
  topics; why simulated sensors matter (test perception before real hardware).
- Cross-link to Chapter 1.4 (humanoid), 2.1 (Gazebo), 2.2 (physics) — don't
  rebuild them.
- Gazebo needs Linux+GPU → pending-env; describe accurately.
- Environment: Gazebo Harmonic, ROS 2 Jazzy, Ubuntu 24.04.

## To save tokens: keep research minimal — reuse the Gazebo/Jazzy environment
facts already established in 2.1 and 2.2. Write early, refine after. Flag
uncertain SDF sensor tag names in your report rather than deep-researching them.

## Constraints
- Draft + self-check against skill only. NO reviewer agents.
- All 4 parts: objectives, theory, code/commands, exercises.
- onBrokenLinks: 'throw' — only link to existing pages (intro, Module 1,
  Module 2 landing, 2.1, 2.2). No links to 2.4+.
- Folder: book/docs/digital-twin/. Filename: simulating-sensors.mdx.
- Run npm run build — must stay green.
- Do NOT write 2.4. Stop after 2.3.

## Summary at end
- Files created + what each contains
- Chapter structure briefly
- Build result
- Confirm stopped before 2.4, did NOT run reviewers

## Response snapshot

Read the spec's Chapter Catalog entry 2.3 (spec.md:338-349) and task T016, plus Chapter 2.2's
frontmatter and opening for convention, then dispatched the `chapter-writer` subagent with the
catalog scope verbatim, an explicit allow-list of the nine linkable existing pages, the Chapter 1.4
humanoid constraint, and hard instructions to run no reviewer agents and stop before 2.4.

The subagent created `book/docs/digital-twin/simulating-sensors.mdx` (`sidebar_position: 4`),
789 lines, four-part shape:

1. Learning objectives (4, mapped to the catalog's "reader can afterwards")
2. Theory — why simulate a sensor at all; what a sensor is inside the simulator, with subsections
   on LiDAR ray casting, depth cameras as per-pixel distance, and what an IMU actually measures;
   sensor frames and placement; noise and the habits a clean sensor teaches; Gazebo topic → ROS 2
   topic bridging
3. Running it — Environment; Example 1 mounting three sensors; Example 2 one node, three sensors
4. Exercises (4, each with a self-check)

Sensors are attached to the existing Chapter 1.4 `simple_humanoid.urdf` with `<gazebo reference>` +
`<pose>` rather than new fixed-joint links, so every mass and inertia figure from 2.2 stays valid:
IMU on `base_link`, `gpu_lidar` on `torso`, `depth_camera` on `head`. A `sensor_world.sdf` adds the
`gz-sim-sensors-system` and `gz-sim-imu-system` plugins (absent from `empty.sdf`) plus a wall at
x = 3.0 m so every reading has a checkable ground truth.

Verified independently after the subagent reported: `npm run build` in `book/` succeeds; `git status`
shows exactly one new file and nothing else touched; all 9 relative links resolve to existing pages.

Uncertainties the subagent flagged for the Module 2 review: `<gz_frame_id>` warning behaviour on
Harmonic; `<lidar>` vs `<ray>` element preference; leading-slash topic-name resolution; fixed-joint
lumping in the URDF→SDF converter; whether Gazebo applies camera Gaussian noise to depth output;
and the predicted numeric readings (2.90 m LiDAR, 2.87 m depth centre, free-fall |a| ≈ 0), which are
derived from geometry rather than observed.

## Outcome

- ✅ Impact: Chapter 2.3 drafted and building green; Module 2 now has 2.1–2.3 drafted, 2.4 remaining before the T017a Module 2 review.
- 🧪 Tests: `npm run build` PASS (verified independently). Chapter code examples remain `pending-env` — Gazebo needs Linux + GPU, unavailable on this Windows machine. `sensor_probe.py` callbacks were exercised against stubbed message types; nothing touching a real DDS graph, the bridge, or Gazebo was executed.
- 📁 Files: 1 chapter created (`simulating-sensors.mdx`, 789 lines); no other repo file modified.
- 🔁 Next prompts: draft Chapter 2.4 (T017, `unity-for-visualization.mdx`), then run T017a — `code-verifier` and `consistency-checker` together over all four Module 2 chapters plus `index.mdx`.
- 🧠 Reflection: the token-discipline instruction ("flag uncertain SDF tags rather than deep-researching") worked as intended — the subagent surfaced six specific uncertainties for the batched review instead of burning context resolving them mid-draft.

## Evaluation notes (flywheel)

- Failure modes observed: chapter came in at ~4,287 prose words against the chapter-authoring skill's 1,200–2,500 guideline. The subagent flagged rather than trimmed, noting siblings 2.2 (4,417) and 2.1 (2,989) — so Module 2 is internally consistent but the skill's budget is being systematically overrun. Worth a decision at the Module 2 review: raise the guideline or split chapters.
- Graders run and results (PASS/FAIL): `npm run build` PASS; cross-link audit PASS; four-part chapter shape PASS; no-forward-links PASS; "every code example executed" FAIL (environment-blocked, disclosed in-chapter as pending-env per 2.1/2.2 convention).
- Prompt variant (if applicable): first PHR in this repo — no prior variant to compare against.
- Next experiment (smallest change to try): give the chapter-writer an explicit word budget for the prose sections up front, and see whether it trims coverage or pushes back before drafting rather than after.
