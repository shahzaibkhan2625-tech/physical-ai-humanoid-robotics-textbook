<!--
Sync Impact Report
==================
Version change: (template, unversioned) → 1.0.0
Bump rationale: MAJOR-equivalent initial ratification. All placeholder tokens replaced with
concrete, project-specific principles; first governed version of this document.

Modified principles:
  - [PRINCIPLE_1_NAME] → I. Learner-First Depth
  - [PRINCIPLE_2_NAME] → II. Runnable Code Only (NON-NEGOTIABLE)
  - [PRINCIPLE_3_NAME] → III. Verified Technical Accuracy (NON-NEGOTIABLE)
  - [PRINCIPLE_4_NAME] → IV. Teach the Why
  - [PRINCIPLE_5_NAME] → V. Predictable Book Structure
  - [PRINCIPLE_6_NAME] → VI. Spec-Driven Development

Added sections:
  - Technology & Security Constraints (was [SECTION_2_NAME])
  - Development Workflow (was [SECTION_3_NAME])

Removed sections: none

Templates requiring updates:
  - ✅ .specify/templates/plan-template.md — "Constitution Check" gate is generic
    ("[Gates determined based on constitution file]"); no principle names hardcoded, no edit needed.
  - ✅ .specify/templates/spec-template.md — no constitution-derived mandatory sections; no edit needed.
  - ✅ .specify/templates/tasks-template.md — task categories are generic; no edit needed.
  - ✅ CLAUDE.md — PHR and ADR guidance already consistent with Principle VI.
  - ✅ README.md — stack table already matches Technology & Security Constraints.

Deferred TODOs: none
-->

# Physical AI & Humanoid Robotics Constitution

An open technical textbook plus a retrieval-augmented chatbot grounded in the book's own
content. Submission for Panaversity Hackathon I.

## Core Principles

### I. Learner-First Depth

The reader is new to robotics but comfortable with Python. Every chapter MUST be written for
that reader: no assumed ROS, simulation, or control-theory background, and no re-teaching
Python basics.

Depth is deliberately moderate, leaning light. A chapter MUST contain clear theory, one to two
working code examples, and a few short exercises. Chapters MUST NOT attempt to be exhaustive
tutorials or API references — the goal is a reader who can learn the concept and run the code,
not a reader who is buried. When a topic is larger than one chapter can carry at this depth,
split it into multiple short chapters rather than expanding one.

*Rationale*: Completeness is the enemy of a textbook someone actually finishes. Bounded chapters
also keep each unit independently reviewable and independently RAG-indexable.

### II. Runnable Code Only (NON-NEGOTIABLE)

Every code example MUST be real, complete, and runnable as shown. Pseudo-code, `...` elisions
standing in for logic, invented APIs, and filler snippets are prohibited.

Python is the code language wherever a choice exists; ROS 2 examples MUST use `rclpy`. Each
example MUST state the environment it assumes (ROS 2 distribution, simulator, required
packages) so the reader can reproduce it.

*Rationale*: A textbook whose code does not run destroys reader trust faster than any other
defect, and this book's chatbot will quote that code back to readers as authoritative.

### III. Verified Technical Accuracy (NON-NEGOTIABLE)

Robotics content — ROS 2, Gazebo, NVIDIA Isaac, and Vision-Language-Action models — MUST be
verified against official documentation at the time of writing (docs.ros.org, gazebosim.org,
NVIDIA developer docs, and primary papers or model cards for VLA). Writing such content from
model memory alone is prohibited.

Verification MUST cover API names and signatures, CLI invocations, package and distribution
names, and version-specific behaviour. Where a claim is version-dependent, the chapter MUST
name the version it targets.

*Rationale*: This stack moves fast and renames things between releases. Unverified detail is the
most likely source of examples that fail on the reader's machine.

### IV. Teach the Why

Tone is clear, direct, and teaching-oriented. Every chapter MUST explain why a mechanism exists
and what problem it solves before showing how to use it. Sequences of steps presented without
their motivation are incomplete.

Prose MUST avoid marketing language, hedging, and padding. Prefer short sentences and concrete
examples over abstraction.

*Rationale*: Readers who understand the motivation can transfer the idea to problems the book
never covers; readers who only memorised steps cannot.

### V. Predictable Book Structure

The book is organised into exactly four modules, matching the course outline:

1. **ROS 2** — the robotic nervous system
2. **Gazebo & Unity** — the digital twin
3. **NVIDIA Isaac** — the AI-robot brain
4. **Vision-Language-Action (VLA)**

Each module MUST be a folder under `book/docs/` containing several short chapter files. Chapter
order MUST be controlled by `sidebar_position` frontmatter, never by filename ordering alone.

Every chapter MUST contain, in this order: learning objectives, theory, code example(s), and
exercises. A chapter missing any of these four is not complete.

*Rationale*: A fixed shape makes chapters comparable for the reader, reviewable against a
checklist, and cleanly chunkable for retrieval.

### VI. Spec-Driven Development

Work is specified before it is implemented. Non-trivial features MUST have a spec, and a plan
derived from that spec, before code is written.

A Prompt History Record MUST be written after each prompt, routed under `history/prompts/` per
`CLAUDE.md`. Architecturally significant decisions MUST be surfaced as ADR suggestions and MUST
NOT be recorded as ADRs without explicit consent.

Commits MUST be small and descriptively messaged — one coherent change per commit.

*Rationale*: The hackathon is judged on the process as well as the artifact, and a traceable
chain from prompt to spec to commit is what makes the work auditable.

## Technology & Security Constraints

**Book**: Docusaurus 3, deployed to GitHub Pages.

**Backend**: FastAPI on Python 3.12, deployed to Hugging Face Spaces. Python 3.12 is a hard pin
— the toolchain MUST NOT fall back to a newer system Python.

**RAG chatbot**: OpenAI Agents SDK pointed at Gemini for generation, Qdrant for vector storage,
Neon Postgres for chat history.

**Secrets**: Never hardcode secrets, API keys, or connection strings. All credentials live in
`.env`, which MUST remain untracked; `.env.example` documents required variable names with no
real values. Deployed environments receive secrets through their platform's secret store.

**Dependencies**: Every dependency MUST be added through its package manager — `uv add` for
Python, `npm` for the book site. Hand-editing `pyproject.toml`, `uv.lock`, `package.json`, or
`package-lock.json` to add or bump a dependency is prohibited, because it desynchronises the
lockfile from the manifest.

## Development Workflow

1. **Specify** — capture intent in `specs/<feature>/spec.md` before implementing.
2. **Plan** — record architecture and technical choices in `specs/<feature>/plan.md`; surface ADR
   suggestions for significant decisions.
3. **Task** — break the plan into testable tasks in `specs/<feature>/tasks.md`.
4. **Implement** — smallest viable diff; no unrelated refactoring.
5. **Record** — write the PHR for the exchange; commit with a descriptive message.

Quality gates before a chapter is considered done:

- [ ] Contains learning objectives, theory, code example(s), and exercises (Principle V)
- [ ] Every code example has been executed and produces the stated result (Principle II)
- [ ] Robotics claims checked against official docs, with target versions named (Principle III)
- [ ] Chapter is in the correct module folder with a `sidebar_position` set (Principle V)
- [ ] Site builds cleanly (`npm run build` in `book/`)

Quality gates before backend code is merged:

- [ ] No secrets in tracked files; new variables added to `.env.example`
- [ ] Dependencies added via `uv add`, lockfile committed
- [ ] Runs on Python 3.12

## Governance

This constitution supersedes other practices and conventions in this repository. Where guidance
conflicts, this document wins; `CLAUDE.md` and the `.specify/templates/` files are subordinate
and MUST be brought into line when they diverge.

**Amendments** require an explicit request, an edit to this file, a version bump per the policy
below, and a Sync Impact Report recorded in the HTML comment at the top of this file. Amendments
that invalidate existing content MUST state how that content will be migrated.

**Versioning policy** (semantic):

- **MAJOR** — a principle is removed or redefined in a backward-incompatible way.
- **MINOR** — a principle or section is added, or guidance is materially expanded.
- **PATCH** — clarifications, wording, and typo fixes that do not change meaning.

**Compliance** is verified at planning time via the Constitution Check gate in
`.specify/templates/plan-template.md`, and at review time against the quality gates above.
Deviations MUST be recorded in the plan's Complexity Tracking table with the simpler alternative
that was rejected and why. Undocumented deviations are defects.

**Version**: 1.0.0 | **Ratified**: 2026-08-09 | **Last Amended**: 2026-08-09
