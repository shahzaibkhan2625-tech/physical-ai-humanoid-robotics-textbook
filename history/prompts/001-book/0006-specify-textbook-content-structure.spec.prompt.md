---
id: 0006
title: Specify Textbook Content Structure
stage: spec
date: 2026-08-09
surface: agent
model: claude-opus-5[1m]
feature: 001-book
branch: 001-book
user: shahzaibkhan2625-tech
command: /sp.specify
labels: ["spec", "book", "content", "curriculum", "ros2", "gazebo", "isaac", "vla", "docusaurus"]
links:
  spec: specs/001-book/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-book/spec.md
  - specs/001-book/checklists/requirements.md
  - history/prompts/001-book/0006-specify-textbook-content-structure.spec.prompt.md
tests:
  - none (specification artifact; validated against specs/001-book/checklists/requirements.md)
---

## Prompt

/sp.specify

Create the specification for the textbook content (feature: book).

## What this feature is
The complete "Physical AI & Humanoid Robotics" textbook — the written
content only. Not the chatbot, not deployment. Docusaurus MDX chapters
organized into 4 modules under book/docs/.

## Structure (required)
Four module folders, each with short chapters:

Module 1 — ROS 2 (Robotic Nervous System)
  - Introduction to Physical AI & Embodied Intelligence
  - ROS 2 Architecture: Nodes, Topics, Services
  - Bridging Python Agents with rclpy
  - URDF: Describing a Humanoid

Module 2 — Gazebo & Unity (Digital Twin)
  - Gazebo Setup & Simulation Basics
  - Physics, Gravity & Collisions
  - Simulating Sensors: LiDAR, Depth Cameras, IMU
  - Unity for Robot Visualization

Module 3 — NVIDIA Isaac (AI-Robot Brain)
  - Isaac Sim & Synthetic Data
  - Isaac ROS & Visual SLAM
  - Nav2: Path Planning for Bipeds

Module 4 — Vision-Language-Action (VLA)
  - Voice-to-Action with Whisper
  - Cognitive Planning with LLMs
  - Capstone: The Autonomous Humanoid

## Requirements
- Each chapter follows the constitution's 4-part shape: learning
  objectives, theory, 1-2 runnable code examples, short exercises.
- Depth: moderate, leaning light (per constitution).
- Code in Python / rclpy where applicable.
- Module folders and chapter files ordered via sidebar_position.
- Content must be technically accurate, verified against official docs
  when written (this spec defines WHAT, not the writing itself).

## Out of scope (state explicitly in the spec)
- RAG chatbot (separate spec)
- Deployment / CI (later phase)
- Personalization, translation (later features)

## Success criteria
- All 4 modules and their chapters are defined with clear scope per chapter.
- Each chapter's spec says what a reader should be able to do after it.
- Structure maps cleanly to book/docs/ folders and sidebar order.

Do not write chapter content yet. This is the spec only.
After creating it, summarize what you defined and flag anything ambiguous
you had to decide.

## Response snapshot

Created branch `001-book` via `.specify/scripts/powershell/create-new-feature.ps1 -Number 1
-ShortName "book"` (no prior feature branches or `specs/` directories existed, so number 001).

Wrote `specs/001-book/spec.md` containing:

- **Scope / out of scope** — out-of-scope section explicitly names the RAG chatbot, deployment
  and CI, personalization and translation, plus backend work, site theming, and
  video/interactive/notebook formats.
- **4 prioritized user stories (P1–P4)**, one per module, each independently testable, plus a
  reviewer scenario. P1 (Module 1) is a standalone viable slice.
- **Edge cases** — chapter exceeding the depth budget, reader lacking required hardware, official
  docs contradicting planned scope, duplicated background between chapters, an example that
  cannot be made runnable, and a reader entering mid-book.
- **20 functional requirements** in three groups (structure FR-001…006, chapter content
  FR-007…016, consistency FR-017…020) and 4 NFRs covering depth, tone, assumed background, and a
  clean build.
- **Chapter Catalog** — all 14 chapters. Each entry gives what it covers, what is deliberately
  out of scope, its code example subject, and a "reader can afterwards" line that is the
  chapter's acceptance test. Module headers carry a module outcome and prerequisites.
- **Key entities** — Module, Chapter, Learning objective, Code example, Exercise, Running
  humanoid model.
- **12 measurable success criteria** (SC-001…012).
- **10 assumptions**, **4 dependencies**, **3 risks**.

Also wrote `specs/001-book/checklists/requirements.md`; all 16 items pass on iteration 1, with
notes recording how "no implementation details" was interpreted for a feature whose subject
matter is itself technical.

Zero `[NEEDS CLARIFICATION]` markers used. Three genuine judgement calls were resolved as
documented assumptions instead: (2) target platform is the current ROS 2 LTS + paired Gazebo
release, expected Jazzy + Harmonic, with mandatory re-verification against official docs during
planning; (3) one custom URDF humanoid authored in Chapter 1.4 and reused book-wide rather than a
third-party model; (4) Module 3 is written to read without an RTX GPU but its examples are not
downgraded to hardware-free substitutes. Additional decisions flagged: 14 chapters split
4/4/3/3, a ~1,200–2,500-word prose band as the operational reading of "moderate, leaning light",
ROS 2 actions deferred from Chapter 1.2 to Chapter 3.3 where they are first needed, and exercises
shipping with self-check descriptions rather than published solutions.

No chapter content was written, per the instruction.

## Outcome

- ✅ Impact: Feature `001-book` specified end-to-end; the book's structure, per-chapter scope, and
  per-chapter reader outcomes are now fixed and reviewable before any prose is written.
- 🧪 Tests: None — specification artifact. Validated against the 16-item quality checklist at
  `specs/001-book/checklists/requirements.md` (all pass).
- 📁 Files: `specs/001-book/spec.md` (new), `specs/001-book/checklists/requirements.md` (new),
  this PHR.
- 🔁 Next prompts: `/sp.clarify` to settle the target ROS 2 / Gazebo release and the humanoid
  model source before writing starts, then `/sp.plan`.
- 🧠 Reflection: The chapter catalog carries the real weight of this spec — each chapter's "reader
  can afterwards" line doubles as its acceptance test, which is what makes SC-005 checkable rather
  than aspirational. Deferring ROS 2 actions to Chapter 3.3 was the one ordering decision that
  changed the catalog rather than just describing it.

## Evaluation notes (flywheel)

- Failure modes observed: none blocking. The template's "no implementation details / write for
  non-technical stakeholders" criteria fit an engineering feature better than a content feature —
  the resolution is recorded in the checklist notes rather than by weakening the spec.
- Graders run and results (PASS/FAIL): `specs/001-book/checklists/requirements.md` — 16/16 PASS
  on iteration 1.
- Prompt variant (if applicable): none.
- Next experiment (smallest change to try): during `/sp.plan`, verify Assumption 2 against
  docs.ros.org and gazebosim.org first; a different LTS pairing would ripple through every
  chapter's stated environment and is the cheapest thing to get wrong early.
