# Feature Specification: Textbook Content ("book")

**Feature Branch**: `001-book`
**Created**: 2026-08-09
**Status**: Draft
**Input**: User description: "Create the specification for the textbook content (feature: book). The complete 'Physical AI & Humanoid Robotics' textbook — the written content only. Not the chatbot, not deployment. Docusaurus MDX chapters organized into 4 modules under `book/docs/`."

## Overview

This feature is the **written content of the textbook** and nothing else: 4 modules containing
14 short chapters, each following the constitution's fixed 4-part chapter shape (learning
objectives → theory → code example(s) → exercises), placed under `book/docs/` in a folder and
ordering scheme that a reader can navigate front-to-back.

This spec defines **what each chapter must cover and what a reader must be able to do after
reading it**. It does not write the chapters, and it does not decide prose, diagrams, or
per-example source code — those are produced during implementation, verified against official
documentation at the time of writing (Constitution Principle III).

## Scope

### In scope

- The chapter catalog: 4 modules, 14 chapters, with per-chapter scope and reader outcomes.
- The required shape of every chapter (Constitution Principle V).
- The folder layout under `book/docs/` and the reading order of modules and chapters.
- Module landing pages and the book's introduction page.
- Depth calibration: moderate, leaning light (Constitution Principle I).

### Out of scope *(explicitly excluded from this feature)*

- **RAG chatbot** — retrieval, embedding, indexing, chat UI, and chat history are a separate
  spec. Nothing in this feature may depend on the chatbot existing.
- **Deployment and CI** — GitHub Pages publishing, build pipelines, preview environments, and
  release automation are a later phase. This feature ends at content that builds locally.
- **Personalization and translation** — reader accounts, progress tracking, difficulty
  adaptation, and non-English versions are later features.
- **Backend work** — the FastAPI service is untouched by this feature.
- **Site theming and design** — custom Docusaurus theme, styling, and branding are not part of
  writing the content.
- **Video, interactive simulators, and hosted notebooks** — chapters are text and code.

## User Scenarios & Testing *(mandatory)*

The primary user is the **reader**: someone comfortable with Python who has no robotics,
simulation, or control-theory background. A secondary user is the **reviewer** who must judge
whether a chapter is done.

### User Story 1 - Reader learns ROS 2 fundamentals and can run their own node (Priority: P1)

A reader arrives knowing Python and nothing about robotics. They read Module 1 front-to-back,
understand what Physical AI is and why robots need a middleware, and finish by writing and
running their own `rclpy` node and describing a humanoid in URDF.

**Why this priority**: Module 1 is the foundation every later module builds on, and it is the
only module that is useful entirely on its own. A reader who stops after Module 1 has still
learned a complete, employable skill. It is also the smallest slice that proves the chapter
shape, the folder layout, and the depth calibration all work.

**Independent Test**: Ship only `book/docs/` + Module 1's four chapters. A reader can navigate
from the introduction through chapters 1.1–1.4 in order, and can execute each chapter's code
examples on a machine matching the stated environment.

**Acceptance Scenarios**:

1. **Given** a reader who has never used ROS 2, **When** they finish Chapter 1.2, **Then** they
   can explain the difference between a topic and a service and say which one to reach for.
2. **Given** a reader with the chapter's stated environment installed, **When** they copy a code
   example verbatim and run it, **Then** it runs and produces the result the chapter states —
   with no edits, no missing imports, and no placeholder values.
3. **Given** a reader on the Module 1 landing page, **When** they follow the sidebar downward,
   **Then** the chapters appear in the order 1.1 → 1.2 → 1.3 → 1.4.
4. **Given** any Module 1 chapter, **When** a reviewer opens it, **Then** it contains learning
   objectives, theory, at least one code example, and exercises, in that order.

---

### User Story 2 - Reader simulates a humanoid and its sensors (Priority: P2)

The reader continues into Module 2, stands a robot up in a Gazebo world, sees it fall over and
understands why, then attaches LiDAR, a depth camera, and an IMU and reads their data from ROS 2.
They finish with an understanding of what Unity adds that Gazebo does not.

**Why this priority**: Simulation is what makes the rest of the book reproducible without buying
a robot. It depends on Module 1 (URDF, topics) but nothing depends on it being finished before
Module 1 ships.

**Independent Test**: With Modules 1–2 present, a reader can go from a URDF file to a simulated
robot publishing sensor topics, verified by inspecting those topics.

**Acceptance Scenarios**:

1. **Given** the humanoid model introduced in Chapter 1.4, **When** the reader follows Chapter
   2.1, **Then** that same model loads in the simulator — the book does not switch robots.
2. **Given** Chapter 2.3, **When** the reader runs the example, **Then** they can list the
   sensor topics being published and describe the shape of the data on each.
3. **Given** Chapter 2.2, **When** the reader reads it, **Then** it explains *why* a simulated
   biped falls over, not only which parameters to change.

---

### User Story 3 - Reader gives the robot perception and navigation (Priority: P3)

The reader works through Module 3, generating synthetic training data, running visual SLAM so
the robot knows where it is, and configuring Nav2 so it can plan a path — with the biped-specific
caveats spelled out rather than glossed over.

**Why this priority**: This is where the book becomes "AI-robot brain" rather than "robot
plumbing", but it carries the heaviest hardware requirements, so it is the module most readers
will read without running. It must therefore stand up as reading material on its own.

**Independent Test**: With Modules 1–3 present, a reader can state what synthetic data is for,
what SLAM produces, and what Nav2 needs as input — and a reader with the stated hardware can run
the examples.

**Acceptance Scenarios**:

1. **Given** Module 3, **When** a reader without an RTX-class GPU reads it, **Then** every
   chapter states its hardware requirement up front and remains understandable without the
   hardware.
2. **Given** Chapter 3.3, **When** the reader finishes, **Then** they can name at least one way
   navigation for a biped differs from navigation for a wheeled base.

---

### User Story 4 - Reader connects language to action and builds the capstone (Priority: P4)

The reader finishes with Module 4: speech becomes text, text becomes a plan, and the plan becomes
robot commands. The capstone ties Modules 1–4 into one worked system.

**Why this priority**: It is the payoff and the most memorable part of the book, but it is
meaningless without the three modules beneath it, so it ships last.

**Independent Test**: With all four modules present, a reader can trace a single spoken
instruction end-to-end through every layer the book has taught.

**Acceptance Scenarios**:

1. **Given** the capstone chapter, **When** the reader reads it, **Then** every component it uses
   was introduced in an earlier chapter, and the capstone cites where.
2. **Given** Chapter 4.2, **When** the reader finishes, **Then** they can explain why an LLM plan
   must be validated before it reaches a physical actuator.

---

### Reviewer scenario

**Given** any finished chapter, **When** a reviewer applies the constitution's chapter quality
gates, **Then** each gate can be answered yes/no from the chapter alone, without asking the
author what they intended.

### Edge Cases

- **A chapter grows past the depth budget.** Per Constitution Principle I, split it into two
  short chapters rather than letting one chapter expand. Splitting changes the chapter catalog,
  so it requires a spec update, not a silent edit.
- **A reader lacks the required hardware** (RTX GPU for Isaac Sim, microphone for Whisper). The
  chapter must state the requirement in its opening and must remain readable and conceptually
  complete without it. It must not present hardware as optional when it is not.
- **Official documentation contradicts a planned chapter's scope** (an API was renamed, a package
  was deprecated, a tool was replaced). Documentation wins; the chapter is written to match
  reality and the divergence from this spec is recorded.
- **Two chapters need the same background.** The later chapter cross-links to the earlier one
  rather than re-teaching it. No concept is taught twice.
- **A code example cannot be made runnable as shown** (it needs proprietary assets, a physical
  robot, or a multi-hour training run). The example is replaced with one that can run;
  pseudo-code is never an acceptable substitute (Constitution Principle II).
- **A reader jumps into Module 3 first.** Each module landing page states its prerequisites so
  the reader can tell immediately what they skipped.

## Requirements *(mandatory)*

### Functional Requirements — Structure

- **FR-001**: The book MUST contain exactly four modules, in this order: (1) ROS 2 — The Robotic
  Nervous System, (2) Gazebo & Unity — The Digital Twin, (3) NVIDIA Isaac — The AI-Robot Brain,
  (4) Vision-Language-Action (VLA).
- **FR-002**: Each module MUST be a distinct folder under `book/docs/`, containing that module's
  chapters as separate files. No chapter file may live outside a module folder except the book's
  introduction page.
- **FR-003**: Module order and chapter order MUST be declared explicitly in metadata
  (`sidebar_position` for chapters and the introduction; an equivalent explicit position for each
  module folder). Ordering MUST NOT depend on filename sorting alone.
- **FR-004**: The book MUST contain exactly the 14 chapters listed in the Chapter Catalog below,
  in the order given. Adding, removing, merging, or splitting a chapter requires updating this
  spec first.
- **FR-005**: Each module MUST have a landing page stating what the module covers, what the
  reader needs to have read first, and what they will be able to do at the end.
- **FR-006**: The book MUST have an introduction page that states who the book is for, what
  background is assumed (Python yes; robotics no), how the four modules relate, and what the
  reader will be able to build by the end.

### Functional Requirements — Chapter content

- **FR-007**: Every chapter MUST contain, in this order: (a) learning objectives, (b) theory,
  (c) one or two code examples, (d) short exercises. A chapter missing any of the four is not
  complete (Constitution Principle V).
- **FR-008**: Learning objectives MUST be stated as things the reader will be able to *do*, and
  MUST match the "reader outcomes" recorded for that chapter in the Chapter Catalog.
- **FR-009**: Theory MUST explain why the mechanism exists and what problem it solves before
  explaining how to use it (Constitution Principle IV).
- **FR-010**: Every code example MUST be complete and runnable exactly as printed — no
  pseudo-code, no `...` standing in for logic, no invented APIs (Constitution Principle II).
- **FR-011**: Every code example MUST state the environment it assumes: operating system where
  it matters, ROS 2 distribution, simulator version, and any packages the reader must install.
- **FR-012**: Code MUST be Python wherever a choice exists, and ROS 2 examples MUST use `rclpy`.
  Non-Python code (XML/URDF, C#, YAML, shell) is permitted only where the tool requires it.
- **FR-013**: Every chapter MUST end with 2–4 short exercises that can be attempted using only
  what that chapter and its prerequisites taught. Exercises MUST NOT require assets or services
  the book has not introduced.
- **FR-014**: Every chapter MUST name the versions it targets for any version-dependent claim
  (Constitution Principle III).
- **FR-015**: Technical content MUST be verified against official documentation at the time of
  writing. A chapter that cannot be verified against a primary source MUST NOT make the claim.
- **FR-016**: Chapters MUST cross-link to the earlier chapter that introduced a concept rather
  than re-explaining it, and MUST NOT forward-reference material as a prerequisite.

### Functional Requirements — Consistency

- **FR-017**: The book MUST use one running humanoid robot model, introduced in Chapter 1.4 and
  reused wherever a robot model is needed, so the reader tracks one system across four modules.
- **FR-018**: Terminology MUST be consistent across chapters: a concept named one way in Module 1
  keeps that name in Module 4.
- **FR-019**: Each module landing page MUST state its hardware and software prerequisites, and
  any chapter with requirements beyond its module's baseline MUST restate them in its opening.
- **FR-020**: The book MUST NOT reference the chatbot, deployment, personalization, or
  translation as existing features.

### Non-Functional Requirements

- **NFR-001**: Depth is moderate, leaning light. A chapter is a single sitting: roughly 1,200–2,500
  words of prose excluding code, targeting 15–25 minutes of reading. A chapter materially over
  this budget must be split (see Edge Cases).
- **NFR-002**: Tone is clear, direct, and teaching-oriented. No marketing language, no hedging,
  no padding.
- **NFR-003**: The book MUST assume no prior robotics knowledge and MUST NOT re-teach Python
  fundamentals.
- **NFR-004**: The site MUST build cleanly with the content in place — no broken internal links,
  no unresolved references.

## Chapter Catalog

Fourteen chapters. Each entry states the chapter's scope, what is deliberately left out, and —
the key success test — **what the reader can do afterwards**.

### Module 1 — ROS 2: The Robotic Nervous System

*Module outcome*: the reader can write Python programs that participate in a ROS 2 system and can
describe a humanoid's body in a machine-readable form.
*Prerequisites*: Python; none robotics.

#### 1.1 Introduction to Physical AI & Embodied Intelligence

- **Covers**: what Physical AI means and how it differs from software-only AI; the
  sense–think–act loop; why embodiment makes problems hard (latency, noisy sensors,
  irreversible actions, the sim-to-real gap); why humanoids specifically; a map of the four
  modules as the layers of one system.
- **Out of scope**: history of robotics, hardware teardowns, control theory.
- **Code example**: a minimal sense–think–act loop in plain Python over simulated sensor values —
  no ROS yet — so the reader sees the loop before the middleware.
- **Reader can afterwards**: explain what makes an AI system "physical", name the three stages of
  the loop and give an example of each, and say which module of the book owns which stage.

#### 1.2 ROS 2 Architecture: Nodes, Topics, Services

- **Covers**: the problem ROS 2 solves (many programs, one robot, no shared memory); nodes as
  units of computation; topics for streaming many-to-many data; services for
  request/response; messages and interface types; the discovery model at a conceptual level; the
  CLI for inspecting a running system (`ros2 node`, `ros2 topic`, `ros2 service`).
- **Out of scope**: actions (deferred to where Nav2 needs them), lifecycle nodes, QoS tuning
  beyond naming that it exists, DDS vendor configuration, custom interface packages.
- **Code example**: a talker/listener pair over a topic, then a minimal service client/server —
  both inspected live with the CLI.
- **Reader can afterwards**: describe what a node, topic, and service are; choose between topic
  and service for a given need and justify it; and inspect a running ROS 2 system from the
  command line.

#### 1.3 Bridging Python Agents with rclpy

- **Covers**: `rclpy` in depth enough to be productive — node lifecycle (`init`, spin,
  `destroy_node`), publishers and subscribers with callbacks, timers, parameters; why callbacks
  must not block; how an ordinary Python program (including an AI agent making a decision) plugs
  into the loop.
- **Out of scope**: executors and callback groups beyond naming them, multithreading, custom
  message definitions, async/await patterns.
- **Code example**: a Python "agent" node that subscribes to a sensor topic, decides, and
  publishes a command — the skeleton every later module reuses.
- **Reader can afterwards**: write a `rclpy` node from a blank file that both subscribes and
  publishes, run it, and explain why long work inside a callback stalls the node.

#### 1.4 URDF: Describing a Humanoid

- **Covers**: why a robot needs a machine-readable body description and who consumes it
  (visualization, physics, kinematics); links and joints; the joint types that matter for a
  humanoid; frames and the tree structure; visual vs collision vs inertial geometry and why they
  differ; validating and visualizing the model.
- **Out of scope**: xacro macros beyond a mention, SDF, meshes and materials as an art task,
  closed kinematic chains, full inverse kinematics.
- **Code example**: a simple humanoid URDF built up joint by joint (torso, two arms, two legs,
  head), plus a short Python script that loads it and reports the joint tree.
- **Reader can afterwards**: read a URDF and describe the robot it defines, extend the book's
  humanoid with a new link and joint, and explain why collision geometry is simpler than visual
  geometry.
- **Note**: this chapter produces the running humanoid model required by FR-017.

### Module 2 — Gazebo & Unity: The Digital Twin

*Module outcome*: the reader can stand the humanoid up in a physics simulation, understand why it
behaves the way it does, and read simulated sensor data from ROS 2.
*Prerequisites*: Module 1.

#### 2.1 Gazebo Setup & Simulation Basics

- **Covers**: what a digital twin is for and why simulation precedes hardware; installing and
  launching the simulator; worlds, models, and the scene graph; spawning the Module 1 humanoid;
  the bridge between the simulator and ROS 2 and why it is needed at all; simulation time vs
  wall-clock time.
- **Out of scope**: building custom worlds as a modelling exercise, plugin authoring, distributed
  or headless-cluster simulation.
- **Code example**: launch a world, spawn the humanoid, and confirm from Python that its state is
  visible on ROS 2 topics.
- **Reader can afterwards**: launch a simulation containing the book's humanoid and verify from a
  ROS 2 client that the simulator and ROS 2 are actually talking.

#### 2.2 Physics, Gravity & Collisions

- **Covers**: what a physics engine computes each step; mass, inertia, and centre of mass, and
  why a wrong inertia tensor makes a robot behave absurdly; gravity; collision detection and
  contact response; friction; why a naive biped falls over immediately and what that reveals
  about balance; the step size / stability / speed trade-off.
- **Out of scope**: deriving rigid-body dynamics, comparing physics solvers, soft-body and fluid
  simulation, implementing a balance controller (named as the open problem, not solved).
- **Code example**: run the humanoid under gravity and observe the fall; change mass/inertia or
  friction and observe the difference, reading the outcome programmatically rather than by eye.
- **Reader can afterwards**: explain why their robot fell, identify which physical property to
  change to affect a given behaviour, and describe the cost of shrinking the physics step.

#### 2.3 Simulating Sensors: LiDAR, Depth Cameras, IMU

- **Covers**: why simulated sensors exist and what they are good and bad at; how each of the
  three works and what data it produces; attaching each to the humanoid; the ROS 2 message types
  they publish; sensor noise and why a noiseless sensor teaches bad habits; sensor frames and
  where a sensor sits on the body.
- **Out of scope**: sensor calibration, ray-tracing internals, tactile/force-torque sensors,
  sensor fusion (that is Module 3's job).
- **Code example**: mount LiDAR + depth camera + IMU on the humanoid, then a Python node that
  subscribes to all three and prints one meaningful summary value from each.
- **Reader can afterwards**: add a sensor to a robot model, identify the message type and frame
  it publishes on, and read that data from a Python node.

#### 2.4 Unity for Robot Visualization

- **Covers**: what Unity adds that Gazebo does not (photorealistic rendering, human-facing
  visualization, richer environments) and what it does not replace; the ROS 2 ↔ Unity connection
  at a conceptual level; importing the humanoid; driving a Unity scene from ROS 2 data; when this
  is worth the extra toolchain and when it is not.
- **Out of scope**: Unity as a game-development tutorial, C# scripting beyond the minimum, Unity
  physics as an alternative to Gazebo, XR/VR.
- **Code example**: a Python node publishing joint or pose data that a subscribed Unity scene
  renders — the Python side is the focus, the Unity side is the minimum needed to see it work.
- **Reader can afterwards**: state when to reach for Unity instead of Gazebo, and describe how
  data crosses from ROS 2 into a Unity scene.

### Module 3 — NVIDIA Isaac: The AI-Robot Brain

*Module outcome*: the reader can explain and — with the required hardware — run the perception
and navigation stack that lets a robot know where it is and decide how to get somewhere.
*Prerequisites*: Modules 1–2. **Hardware**: this module's examples require an NVIDIA RTX-class
GPU; every chapter states this and remains readable without one.

#### 3.1 Isaac Sim & Synthetic Data

- **Covers**: what Isaac Sim is and how it differs from Gazebo in purpose; why perception models
  are starved of labelled data and how synthetic data solves it; domain randomization and why it
  works; generating a labelled dataset from a scene; the sim-to-real gap, honestly stated.
- **Out of scope**: training a perception model end-to-end, Omniverse/USD as a content-creation
  tutorial, photorealistic asset authoring, benchmark comparisons.
- **Code example**: generate a small labelled synthetic dataset from a scene containing the
  humanoid, and inspect the resulting images and labels from Python.
- **Reader can afterwards**: explain what synthetic data is for and why randomization matters,
  and produce a small labelled dataset from a simulated scene.

#### 3.2 Isaac ROS & Visual SLAM

- **Covers**: the localization problem — a robot that cannot answer "where am I" can do nothing
  else; what SLAM is and why mapping and localizing are the same problem; what visual SLAM uses
  as input and produces as output (pose estimate + map); what Isaac ROS provides and why GPU
  acceleration matters here; the failure modes (featureless walls, motion blur, drift, loop
  closure) — a reader who does not know these will misdiagnose every failure.
- **Out of scope**: SLAM mathematics, comparing SLAM implementations, LiDAR SLAM, multi-robot
  mapping.
- **Code example**: run visual SLAM against the simulated camera stream and read the resulting
  pose estimate from a Python node.
- **Reader can afterwards**: explain what SLAM consumes and produces, subscribe to a pose
  estimate from Python, and name at least two conditions under which visual SLAM will fail.

#### 3.3 Nav2: Path Planning for Bipeds

- **Covers**: the navigation problem split into global planning and local control; costmaps and
  what turns sensor data into one; Nav2's structure and what it needs as input (a map, a pose, a
  goal); sending a navigation goal from Python; **what changes for a biped** — a footprint that
  moves, discrete foothold placement, balance constraints, and why wheeled-robot assumptions
  break; actions introduced here, where they are actually needed (long-running, cancellable,
  feedback-producing goals).
- **Out of scope**: implementing a planner, tuning every Nav2 parameter, a full footstep planner
  (named as the gap between Nav2 and real bipedal walking), behaviour tree authoring.
- **Code example**: a Python node that sends a navigation goal, receives feedback, and handles
  the result — including cancellation.
- **Reader can afterwards**: describe what Nav2 needs before it can plan, send and cancel a goal
  from Python, and explain at least one reason a wheeled-robot navigation stack is not enough for
  a humanoid.

### Module 4 — Vision-Language-Action (VLA)

*Module outcome*: the reader can connect spoken human instructions to validated robot action, and
can assemble the whole book into one working system.
*Prerequisites*: Modules 1–3.

#### 4.1 Voice-to-Action with Whisper

- **Covers**: why natural language is the right interface for a humanoid; automatic speech
  recognition and where Whisper fits; running transcription locally vs as a service and the
  latency/privacy trade-off; turning a transcript into a structured command; handling
  mis-transcription — a robot that acts on a misheard word is a safety problem, not a UX problem.
- **Out of scope**: training or fine-tuning ASR models, wake-word detection, speaker
  identification, multilingual handling, text-to-speech.
- **Code example**: a Python node that transcribes audio, maps the transcript to a bounded
  command set, and publishes the result on a ROS 2 topic — rejecting anything outside the set.
- **Reader can afterwards**: transcribe speech to text in Python, publish a structured command
  derived from it, and explain why the command set must be bounded.

#### 4.2 Cognitive Planning with LLMs

- **Covers**: the gap between an instruction ("tidy the table") and robot primitives; the LLM as
  a planner that decomposes goals into a sequence of known skills; grounding — why the model may
  only emit actions the robot actually has; structured output as the contract between model and
  robot; **validating a plan before execution**, and why an unvalidated LLM plan reaching an
  actuator is unacceptable; failure and replanning; where VLA models fit relative to this
  approach.
- **Out of scope**: training or fine-tuning a VLA model, prompt-engineering technique catalogues,
  comparing model providers, RL for robotics.
- **Code example**: a Python node that turns an instruction into a validated plan of known
  primitives, rejects out-of-vocabulary actions, and dispatches the accepted steps to ROS 2.
- **Reader can afterwards**: design a bounded skill vocabulary, get an LLM to plan within it,
  validate the plan before dispatch, and explain what grounding means and why it is required.

#### 4.3 Capstone: The Autonomous Humanoid

- **Covers**: assembling every layer into one system — spoken instruction → transcript → plan →
  navigation goal → simulated humanoid acting, with perception in the loop; the architecture as a
  whole and where each earlier chapter's component sits; running it end-to-end; how it fails and
  how to trace a failure to the responsible layer; an honest account of what this system cannot
  do and what real deployment would additionally require.
- **Out of scope**: new concepts — the capstone introduces nothing not already taught; hardware
  deployment; long-horizon autonomy.
- **Code example**: the integrated system, runnable end-to-end in simulation, presented as
  composed pieces that each cite the chapter they came from.
- **Reader can afterwards**: run the complete system in simulation, trace a single spoken
  instruction through every layer, diagnose which layer a given failure belongs to, and state
  what the system would need before it could run on real hardware.

## Key Entities

- **Module**: one of exactly four thematic units. Has a position, a title, a landing page, stated
  prerequisites, and an ordered set of chapters.
- **Chapter**: the atomic unit of the book. Has a position within its module, a title, and
  exactly four ordered parts (objectives, theory, code example(s), exercises). Independently
  readable given its stated prerequisites, and independently reviewable against the constitution's
  quality gates.
- **Learning objective**: a statement of something the reader will be able to *do*, traceable to
  the chapter's "reader can afterwards" entry in this catalog.
- **Code example**: a complete, runnable program with a stated environment and a stated expected
  result. One or two per chapter.
- **Exercise**: a short task solvable with only the material taught so far. Two to four per
  chapter.
- **Running humanoid model**: the single robot description introduced in Chapter 1.4 and reused
  book-wide.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 4 modules and all 14 catalogued chapters exist, each in the correct module, in
  the specified order — verifiable by walking the navigation top to bottom.
- **SC-002**: 100% of chapters contain all four required parts in the required order.
- **SC-003**: 100% of code examples have been executed by the author and produce the result the
  chapter states. Zero examples contain pseudo-code, elisions, or invented APIs.
- **SC-004**: 100% of chapters state the environment and versions their examples assume.
- **SC-005**: Every chapter's learning objectives match its "reader can afterwards" entry in this
  catalog — no chapter promises less or drifts elsewhere.
- **SC-006**: A reader with the stated background can complete any single chapter in 15–25
  minutes of reading, and prose length falls within the NFR-001 band.
- **SC-007**: 100% of chapters end with 2–4 exercises answerable from material already taught.
- **SC-008**: Zero broken internal links; the site builds with no errors or warnings introduced
  by this content.
- **SC-009**: A reader who follows Modules 1–4 in order encounters no concept used before it is
  introduced.
- **SC-010**: One humanoid model is used book-wide; zero chapters silently substitute a different
  robot.
- **SC-011**: An independent reviewer can mark every constitution chapter quality gate pass/fail
  from the chapter text alone, without consulting the author.
- **SC-012**: Zero references in the content to the chatbot, deployment, personalization, or
  translation as existing features.

## Assumptions

Decisions taken here in the absence of explicit direction. Each is reversible, but reversing one
after chapters are written is expensive — flag disagreement before implementation starts.

1. **14 chapters, distributed 4 / 4 / 3 / 3.** This is the chapter list as given in the request,
   taken as authoritative and fixed.
2. **Target platform is CONFIRMED as ROS 2 Jazzy Jalisco + Gazebo Harmonic on Ubuntu 24.04
   (Noble)**, verified 2026-08-09. This is the book-wide target and MUST be named in every chapter
   per FR-014.

   - Jazzy Jalisco: released 2024-05-23, LTS, supported to 2029-05; Tier 1 platform Ubuntu 24.04.
     Still actively maintained — Patch Release 8 shipped 2026-06-18.
   - Gazebo Harmonic: LTS, supported to 2029-05; the official `ros_gz` pairing for Jazzy.
     Support windows align, so the pair goes end-of-life together.

   **A newer LTS exists and was deliberately not chosen.** ROS 2 Lyrical Luth (released
   2026-05-22, LTS to 2031-05, Ubuntu 26.04, paired with Gazebo Jetty) supersedes Jazzy on
   currency. It is rejected because **NVIDIA Isaac ROS — which Module 3 depends on entirely —
   states that all its packages are designed and tested against ROS 2 Jazzy on Ubuntu 24.04, and
   does not mention Lyrical or Ubuntu 26.04**. Isaac Sim likewise lists only Humble and Jazzy as
   officially tested, recommending Jazzy on 24.04. Targeting Lyrical would make Module 3's code
   examples unverifiable, breaking Constitution Principle II (runnable code only) — so the oldest
   dependency in the stack, not the newest release, sets the target.

   *Consequence for chapters*: Jazzy's canonical `rclpy` idiom is
   `rclpy.init(args=args)` … `destroy_node()` … `rclpy.shutdown()`. The context-manager form
   (`with rclpy.init(args=args):`, with `ExternalShutdownException` handling) and the experimental
   `rclpy.experimental.AsyncNode` are Lyrical-era and MUST NOT appear in chapter code. The Node
   API itself — `create_publisher`, `create_subscription`, `create_timer`, `spin`, `get_logger` —
   is unchanged between the two.

   *Re-verification trigger*: revisit this decision if Isaac ROS publishes Lyrical support, or
   before Jazzy's 2029-05 end of life, whichever comes first.
3. **One running humanoid, authored in Chapter 1.4** — a simple custom URDF rather than a
   third-party model. Rationale: it keeps the book self-contained, avoids a licensing and
   availability dependency, and makes Chapter 1.4 produce something the rest of the book uses.
   The trade-off is that it will be cruder than an off-the-shelf humanoid.
4. **Module 3 is written to be read without an RTX GPU.** Isaac Sim and Isaac ROS have hard GPU
   requirements that many readers will not meet. Chapters state the requirement, and their theory
   sections stand alone; the code examples remain real and runnable for readers who do meet it.
   Module 3 is not downgraded to hardware-free substitutes.
5. **Chapter depth band of ~1,200–2,500 words of prose** is the operational reading of the
   constitution's "moderate, leaning light". Used as a review signal, not a hard gate.
6. **English only, prose and code only** — no video, no interactive widgets, no notebooks.
7. **Exercises ship without published solutions.** Each exercise instead states what a correct
   result looks like so a reader can self-check. Solutions may be added as a later feature.
8. **Actions (the third ROS 2 communication primitive) are introduced in Chapter 3.3**, not in
   Chapter 1.2, so the concept arrives with a real use for it. Chapter 1.2 names that a third
   primitive exists and points forward.
9. **Diagrams are permitted but not required.** Where one is used it must be text-authored
   (renderable from source in-repo) rather than a binary image, so it stays reviewable and
   indexable.
10. **The introduction page replaces the current placeholder** at `book/docs/intro.mdx`.

## Dependencies

- **Constitution v1.0.0** — Principles I–V govern this feature directly; the chapter quality gates
  in the Development Workflow section are this feature's definition of done.
- **Existing book scaffold** — a Docusaurus site already exists at `book/` with a filesystem-driven
  navigation and a placeholder introduction page.
- **External documentation** must be reachable at writing time for verification (Principle III):
  docs.ros.org, gazebosim.org, NVIDIA Isaac developer documentation, Unity Robotics documentation,
  and primary sources for Whisper and VLA models.
- **A working local environment** matching Assumption 2 is required to execute every code example
  before publication (SC-003). Module 3 additionally requires RTX-class GPU access.

## Risks

- **Verification cost dominates.** Principle III forbids writing from model memory, so every
  chapter carries a documentation-checking and code-execution cost far above its writing cost.
  Module 3 is the worst case. Mitigation: sequence by user-story priority so Module 1 ships
  complete before Module 3 starts.
- **Environment drift breaks examples.** A distribution or package release during writing can
  invalidate earlier chapters. Mitigation: pin one book-wide target (Assumption 2), name it in
  every chapter, and treat a target change as a spec amendment.
- **Module 3's hardware requirement blocks execution.** Without RTX-class GPU access, SC-003
  cannot be met for three chapters. Mitigation: confirm hardware access before Module 3 planning;
  if unavailable, the scope reduction must be an explicit decision, not a quiet downgrade.
