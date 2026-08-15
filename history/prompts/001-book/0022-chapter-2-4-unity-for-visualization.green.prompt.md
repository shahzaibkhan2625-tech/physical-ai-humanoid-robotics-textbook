---
id: 0022
title: Chapter 2.4 Unity for robot visualization
stage: green
date: 2026-08-15
surface: agent
model: claude-opus-5[1m]
feature: 001-book
branch: main
user: shahzaibkhan2625-tech
command: (direct prompt — Phase 4, task T017)
labels: ["book", "module-2", "chapter-2.4", "T017", "unity", "ros-tcp-endpoint", "unity-robotics-hub", "draft-only", "no-reviewers", "pending-env", "word-budget-breach", "filename-divergence", "unsupported-ros-pairing"]
links:
  spec: specs/001-book/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - book/docs/digital-twin/unity-visualization.mdx
tests:
  - npm run build (book/) — PASSED, run twice; once by the chapter-writer and once independently by the orchestrator against the shipped file. [SUCCESS] Generated static files in "build". No warnings, no broken links
  - onBrokenLinks 'throw' confirmed set at docusaurus.config.ts:28, so the green build is a real link check; 9 outbound links, all inside the allowlist (2.1 x3, 2.2, 2.3, 1.4 x2, 1.2, 1.3)
  - joint_wave.py — ast.parse clean, py_compile clean, extracted programmatically from the shipped .mdx; rclpy idiom assertions pass (rclpy.init(args=args) / destroy_node() / shutdown() present; no `with rclpy.init`, no ExternalShutdownException, no invented AsyncNode). NOT EXECUTED — needs ROS 2 Jazzy on Ubuntu 24.04
  - joint_wave.py clamp + sine arithmetic — EXECUTED standalone (pure math, no ROS), 10 s at 30 Hz; every printed value reproduced: shoulder pinned -1.4, elbow -1.9..-0.1, neck -0.4..+0.4, wave_hz=0 settles elbow at -1.0 (Ex 1 self-check), Ex 2 clamped -2.5/0.0 vs unclamped -4.0/+2.0
  - JointStateReceiver.cs — NEVER COMPILED. No C# toolchain, no Unity Editor, connector API not checkable
  - ROS-TCP-Endpoint colcon build, ros2 launch endpoint.py, ros2 node info /UnityEndpoint, topic echo/hz, param set — all pending-env, NOT EXECUTED. Launch filename and node name are source-verified against the main-ros2 branch; the emitted transcripts are derived, not observed
  - code-verifier / consistency-checker — DELIBERATELY NOT RUN; they run once per module at T017a
  - Prose ~3,606 words against the NFR-001 band of 1,200–2,500 — BREACH, unresolved, escalated to T017a (below both neighbours: 2.2 is ~4,417, 2.3 is ~4,287)
  - Verification-log row — NOT WRITTEN. 2.1 and 2.3 have no rows either; the log's table jumps 1.4 -> 2.2 and its Summary counts (16 examples / 4 executed / 12 pending-env) are now stale by three chapters. Backfill at T017a
---

## Prompt

Module 2, Chapter 2.4 — DRAFT ONLY. Do NOT run reviewers (they run at the
Module 2 review right after this chapter). Follow specs/001-book/tasks.md.

## Chapter 2.4
Use the chapter-writer subagent to write Chapter 2.4
"Unity for Robot Visualization" at
book/docs/digital-twin/unity-visualization.mdx (per spec's Chapter Catalog
entry for 2.4), applying the chapter-authoring skill.

Key requirements:
- Teach: what Unity adds over Gazebo (high-fidelity visualization, rendering,
  human-facing views), the Unity–ROS 2 connection (Unity Robotics Hub /
  ROS-TCP), when to use Unity vs Gazebo, visualizing the Chapter 1.4 humanoid.
- Cross-link to 1.4 (humanoid), 2.1 (Gazebo), 2.2 (physics), 2.3 (sensors).
- Needs Unity + setup → pending-env; describe accurately.
- Environment: Unity + ROS 2 Jazzy bridge, Ubuntu 24.04.

## To save tokens: keep research minimal. Write early, refine after. Flag
uncertain Unity/ROS-TCP version details in your report rather than
deep-researching.

## Constraints
- Draft + self-check against skill only. NO reviewer agents.
- All 4 parts: objectives, theory, code/commands, exercises.
- onBrokenLinks: 'throw' — only link to existing pages (intro, Module 1,
  Module 2 landing, 2.1, 2.2, 2.3). This is the last Module 2 chapter.
- Folder: book/docs/digital-twin/. Filename: unity-visualization.mdx.
- Run npm run build — must stay green.
- Do NOT start the module review. Stop after 2.4 is drafted.

## Summary at end
- Files created + what each contains
- Chapter structure briefly
- Build result
- Confirm stopped, did NOT run reviewers
- Confirm all 4 Module 2 chapters are now drafted

## Response snapshot

Read the spec's Chapter Catalog entry for 2.4 (spec.md:351-362) and T017 (tasks.md:150-152),
inspected the three existing Module 2 chapters for voice and frontmatter, then dispatched the
`chapter-writer` subagent with an explicit link allowlist, the pending-env instruction, and a
token-discipline directive to write early and report uncertainties instead of researching them.
Flagged the filename divergence to the user before the agent finished.

The agent produced `book/docs/digital-twin/unity-visualization.mdx` (27,784 bytes,
`sidebar_position: 5`) and touched nothing else — no edits to the other Module 2 chapters,
`tasks.md`, the spec, the constitution, or the verification log.

Chapter shape, all four required parts present:
- Opening picks up 2.3's closing thread — sensor data as text has the wrong audience
- **Learning objectives** (4), mapping to the catalog's "reader can afterwards" line
- **Two audiences for one simulation** — Gazebo's viewport as instrument vs Unity's renderer as
  persuasion; subsection *What Unity does not replace* states the one-authority rule (Unity
  physics off, Gazebo rules), which is the catalog's "what it does not replace" beat
- **When it is worth the toolchain, and when it is not** — reach-for / stay-with lists plus the
  scene-drift failure mode; this is the decision the catalog asks the reader to be able to make
- **How data crosses: why there is a TCP endpoint** — Unity is not a DDS participant, hence the
  Endpoint/Connector split; five consequences drawn out (the endpoint is a real ROS node; nothing
  arrives until it runs; QoS belongs to the endpoint; it is a network link so Unity can sit on
  another machine; one socket means back-pressure). Subsection *Importing the humanoid* covers
  the URDF Importer, `ArticulationBody`, the joint-name/link-name mismatch, radians vs degrees,
  and the handedness difference
- **Running it** — honesty preamble, Environment table, endpoint build; *Example 1* is
  `joint_wave.py` (the Python focus the catalog demands); *Example 2* is `JointStateReceiver.cs`,
  the minimum C# to see it move, plus a 5-step ordered diagnosis
- **Exercises** (4), each with a self-check, no solutions published
- Closing wraps the module; Module 3 named in prose only, never linked

Verified independently by the orchestrator: the file exists with the right frontmatter, the
heading tree matches the reported structure, and `npm run build` is green with
`onBrokenLinks: 'throw'` active.

Deliberately not done: no reviewer agents, no verification-log edit, no `tasks.md` edit.

## Outcome

- ✅ Impact: Chapter 2.4 drafted; **all four Module 2 chapters (2.1–2.4) plus the landing page are
  now drafted**, which satisfies the precondition for T017a, the batched Module 2 review.
- 🧪 Tests: `npm run build` green (run twice, independently). `joint_wave.py` static-clean and its
  arithmetic executed and reproduced; the C#, the endpoint build, and every `ros2` command are
  pending-env and say so in the chapter.
- 📁 Files: `book/docs/digital-twin/unity-visualization.mdx` (new, 27,784 bytes). One file, no
  collateral edits.
- 🔁 Next prompts: T017a — launch `code-verifier` **and** `consistency-checker` together in fresh
  context, each scoped to all four Module 2 chapters plus `index.mdx`; then T018 (build + module
  ordering) and T019 (reconcile the verification log for all of Module 2).
- 🧠 Reflection: the token-discipline instruction worked as intended — the agent spent its
  research budget on the two facts that were load-bearing and checkable (the endpoint's launch
  filename and node name, read from the `main-ros2` source) and declined to assert the ones that
  were not (package git URLs, importer menu path, Unity LTS version). Declining to print an
  unverified URL is the right trade; it costs the reader one lookup and costs the book nothing.

## Evaluation notes (flywheel)

- Failure modes observed:
  1. **Filename divergence, unresolved.** The user specified `unity-visualization.mdx`; T017
     specifies `unity-for-visualization.mdx`. The user's instruction was explicit and repeated, so
     the file uses it and `tasks.md` was left alone — the two now disagree, and the divergence was
     surfaced to the user rather than silently reconciled. **Must be settled at T017a**, in one
     direction or the other.
  2. **Word-budget breach, third in a row.** 3,606 prose words against NFR-001's 1,200–2,500. Two
     chapters in a row breaching was a signal; three is a pattern, and the pattern says the band
     is wrong for this book rather than that three chapters independently overran. Module 2 now
     averages ~4,100 words per chapter. T017a should decide: amend NFR-001, or cut ~40% from four
     chapters.
  3. **No supported Jazzy pairing for Unity Robotics Hub.** The Hub's stated ROS support is
     Melodic / Noetic / Foxy. The chapter says so in the open and reasons that the endpoint is a
     plain `ament_python`/`rclpy` package so a source build should work — but "should work" is
     the weakest claim in Modules 1–2, and it is load-bearing for the whole chapter.
  4. **Unverified C# API is the highest-risk content.** `ROSConnection.GetOrCreateInstance()
     .Subscribe<JointStateMsg>(...)`, the `RosMessageTypes.Sensor` /
     `Unity.Robotics.ROSTCPConnector` namespaces, and `ArticulationBody.xDrive.target` being in
     **degrees** — the last of which carries a teaching point ("57 times") built on top of it. All
     written from documented API, none checked against connector source.
  5. **Verification-log drift is now systemic, not incidental.** Three of four Module 2 chapters
     have no row (2.1, 2.3, 2.4) and the Summary counts are stale. The per-chapter habit of
     deferring the log has compounded across the module.
- Graders run and results (PASS/FAIL):
  - `npm run build` with `onBrokenLinks: 'throw'` — **PASS** (twice, second run by the orchestrator)
  - Link allowlist (only intro / Module 1 / Module 2 landing / 2.1 / 2.2 / 2.3) — **PASS**, 9 links
  - No forward reference to Module 3 as an existing page — **PASS** (named in prose, never linked)
  - Four required parts present (objectives, theory, code/commands, exercises) — **PASS**
  - Single humanoid maintained (`simple_humanoid.urdf`, joint limits read from 1.4) — **PASS**
  - `joint_wave.py` syntax + rclpy idiom + arithmetic — **PASS**
  - Catalog out-of-scope respected (no game-dev tutorial, no Unity-physics-as-alternative, no XR) — **PASS**
  - Constitution gate "every code example has been executed and produces the stated result" — **FAIL**,
    accepted as pending-env, 5 of 5 examples unexecuted (1 arithmetic core excepted)
  - NFR-001 depth budget — **FAIL** (3,606 vs 1,200–2,500)
  - Verification-log row present — **FAIL** (absent, deferred to T017a)
- Prompt variant (if applicable): draft-only, reviewers batched at the module boundary (plan D4) —
  fourth and final chapter under this variant, and the first to also carry an explicit
  token-discipline clause ("keep research minimal, write early, flag uncertainties rather than
  researching them"). That clause is worth keeping: it produced a report with seven precisely
  scoped review items instead of a chapter with seven silent guesses.
- Next experiment (smallest change to try): at T017a, give both reviewers the chapter-writer's
  seven-item uncertainty list as an explicit checklist rather than letting them rediscover it —
  and measure whether they surface anything beyond it. If they do not, the writer's self-reported
  uncertainty list is a reliable substitute for part of the review, and the loop gets cheaper.
