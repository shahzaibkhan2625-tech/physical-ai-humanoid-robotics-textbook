---
id: 0005
title: Fill Project Constitution
stage: constitution
date: 2026-08-09
surface: agent
model: claude-opus-5[1m]
feature: none
branch: main
user: shahzaibkhan2625-tech
command: /sp.constitution
labels: ["constitution", "governance", "content-standards", "docusaurus", "ros2", "rag", "sdd"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
  - history/prompts/constitution/0005-fill-project-constitution.constitution.prompt.md
tests:
  - none
---

## Prompt

Set up the project constitution for a technical textbook titled
"Physical AI & Humanoid Robotics". This is a Panaversity Hackathon I
submission. Fill in the placeholders in .specify/memory/constitution.md
with these principles:

## Content principles
- Audience: learners new to robotics but comfortable with Python.
- Depth: moderate, leaning slightly light. Each chapter = clear theory +
  1-2 working code examples + a few short exercises. NOT exhaustive
  tutorials — enough to learn and run, not overwhelm.
- All code examples must be real and runnable, not pseudo-code or filler.
- Robotics content (ROS 2, Gazebo, Isaac, VLA) must be technically accurate.
  When writing chapters later, verify against official docs (docs.ros.org,
  gazebosim.org, NVIDIA docs) rather than relying on memory.
- Code language: Python (rclpy for ROS 2) wherever a choice exists.
- Tone: clear, direct, teaching-oriented. Explain the "why", not just "how".

## Structure principles
- Book is organized into 4 modules matching the course outline:
  1. ROS 2 (Robotic Nervous System)
  2. Gazebo & Unity (Digital Twin)
  3. NVIDIA Isaac (AI-Robot Brain)
  4. Vision-Language-Action (VLA)
- Each module is a folder under book/docs/ with several short chapter files.
- Chapter order controlled via sidebar_position frontmatter.
- Each chapter has: learning objectives, theory, code example(s), exercises.

## Technical principles
- Book: Docusaurus 3, deployed to GitHub Pages.
- Backend: FastAPI, Python 3.12, deployed to Hugging Face Spaces.
- RAG chatbot: OpenAI Agents SDK pointed at Gemini, Qdrant for vectors,
  Neon Postgres for chat history.
- Never hardcode secrets; keys live in .env only.
- Every dependency added via uv add / npm, never hand-edited.

## Process principles
- Spec-Driven Development: specify before implementing.
- Write a PHR after each prompt.
- Keep commits small and descriptive.

After filling the constitution, show me what you wrote and explain each
principle briefly. Do not create any specs yet — constitution only.

## Response snapshot

Replaced every placeholder token in `.specify/memory/constitution.md` and ratified
it at **v1.0.0** (2026-08-09). The user's four principle groups were mapped onto
six numbered core principles rather than four, because the content group carried
four separable, independently-checkable rules:

- **I. Learner-First Depth** — audience and the deliberate "moderate, leaning
  light" depth ceiling; oversized topics split into more short chapters rather
  than one long one.
- **II. Runnable Code Only (NON-NEGOTIABLE)** — no pseudo-code, no `...` elisions,
  no invented APIs; Python/`rclpy` by default; each example states its assumed
  environment.
- **III. Verified Technical Accuracy (NON-NEGOTIABLE)** — ROS 2 / Gazebo / Isaac /
  VLA claims verified against official docs at writing time, never from model
  memory; version-dependent claims must name their version.
- **IV. Teach the Why** — motivation before mechanism; steps without motivation
  count as incomplete.
- **V. Predictable Book Structure** — the four modules, folders under `book/docs/`,
  `sidebar_position` ordering, and the mandatory four-part chapter shape.
- **VI. Spec-Driven Development** — spec → plan before code, PHR after each prompt,
  ADR suggestions only with consent, small descriptive commits.

The technical group became a **Technology & Security Constraints** section (stack,
`.env`-only secrets, `uv add`/`npm`-only dependency changes) rather than a
principle, since it is a set of standing constraints rather than a rule of craft.
The Python 3.12 pin is stated as hard, matching the existing backend pin. A
**Development Workflow** section adds explicit per-chapter and per-backend quality
gate checklists so the principles are checkable rather than aspirational.

Consistency propagation: `plan-template.md`, `spec-template.md`, and
`tasks-template.md` were read and need no edits — none hardcode principle names,
and the plan template's Constitution Check gate is already generic. `CLAUDE.md`
and `README.md` were verified consistent. No specs were created.

## Outcome

- ✅ Impact: Project now has a ratified v1.0.0 constitution; content, structure, stack, and process rules are enforceable at plan and review time.
- 🧪 Tests: none — governance document only.
- 📁 Files: `.specify/memory/constitution.md` rewritten from template; this PHR created (first entry under `history/prompts/constitution/`).
- 🔁 Next prompts: `/sp.specify` for the first module (ROS 2) once the constitution is accepted; `git config user.name` so commits stop recording `unknown`.
- 🧠 Reflection: Four user-stated principle groups did not map one-to-one onto template slots. Splitting the content group into four testable principles, and demoting the stack list to a constraints section, keeps every principle independently verifiable — which is what the Constitution Check gate needs.

## Evaluation notes (flywheel)

- Failure modes observed: The template's `[PRINCIPLE_6_NAME]` slot had an orphaned `[PRINCIPLE__DESCRIPTION]` token (double underscore) — a defect in the vendored template, resolved by full rewrite. `RATIFICATION_DATE` was unknown; today's date was used since this is the first ratification, not an amendment.
- Graders run and results (PASS/FAIL): manual check — PASS. No unresolved bracket tokens remain; version line matches the Sync Impact Report; both dates are ISO `2026-08-09`; principles use MUST/MUST NOT rather than "should".
- Prompt variant (if applicable): none.
- Next experiment (smallest change to try): When writing the first chapter, run it against the Principle V chapter checklist verbatim and see whether the gate catches anything — that validates whether the gates are actually operable or just decorative.
