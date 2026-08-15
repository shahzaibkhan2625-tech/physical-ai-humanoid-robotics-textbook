# Implementation Plan: Textbook Content ("book")

**Branch**: `001-book` | **Date**: 2026-08-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-book/spec.md`

## Summary

Deliver 14 chapters across 4 modules under `book/docs/`, each following the constitution's fixed
4-part shape, targeting ROS 2 Jazzy + Gazebo Harmonic + Ubuntu 24.04.

The technical approach has three parts:

1. **A fixed folder and ordering scheme** — one folder per module, ordering declared in
   `_category_.json` (modules) and `sidebar_position` (chapters and the introduction), never by
   filename sort.
2. **A three-role authoring pipeline, drafting per chapter and reviewing per module** —
   `chapter-writer` drafts each chapter using the `chapter-authoring` skill; once every chapter in a
   module is drafted, `code-verifier` and `consistency-checker` review the whole module
   independently in fresh contexts; the writer applies fixes. Review is separated from authorship
   because an author checking its own work reports itself green. It is batched per module because
   running both reviewers on every chapter exhausts session usage limits (D4).
3. **A two-stage definition of done** — `drafted` and `verified` — because this machine cannot
   execute ROS 2 code, and the constitution requires execution before a chapter is complete. The
   gap is made explicit and tracked rather than hidden.

## Technical Context

**Language/Version**: Python 3.12 for chapter code (the Ubuntu 24.04 / Jazzy pairing); Node.js ≥20
for the site toolchain (Node 24 in CI)
**Primary Dependencies**: Docusaurus 3.10.2; ROS 2 Jazzy Jalisco (`rclpy`); Gazebo Harmonic;
Nav2; NVIDIA Isaac Sim / Isaac ROS (release-4.5 line); Unity Robotics Hub; Whisper
**Storage**: Filesystem — MDX files under `book/docs/`. No database.
**Testing**: `npm run build` in `book/` as the structural gate; per-example execution in a ROS 2
Jazzy environment as the content gate; `code-verifier` and `consistency-checker` as review gates
**Target Platform**: Reader runs Ubuntu 24.04 (Noble). Book renders as a static site.
**Project Type**: Documentation/content — single Docusaurus site, no application code
**Performance Goals**: Not applicable to content. Site build stays green and fast enough for CI.
**Constraints**: Chapter prose 1,200–2,500 words in Module 1, 1,200–4,500 in Modules 2–4
(NFR-001); every example runnable as printed (Principle II); every robotics claim verified
against official docs (Principle III)
**Scale/Scope**: 4 modules, 14 chapters, 4 module landing pages, 1 introduction page,
4 `_category_.json` files — 23 content artifacts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|---|---|---|
| I. Learner-First Depth | Chapters assume Python, not robotics; 1,200–2,500 words (Module 1) / 1,200–4,500 (Modules 2–4); split rather than expand | ✅ Enforced by `chapter-authoring` Step 7 and `consistency-checker` check 10 |
| II. Runnable Code Only | Every example real, complete, runnable; Python/`rclpy`; environment stated | ⚠️ **Conditional** — see Complexity Tracking. Cannot be met on this machine; plan defines how |
| III. Verified Technical Accuracy | Claims checked against official docs; versions named | ✅ Target confirmed (spec Assumption 2); source table in the skill; `code-verifier` re-checks independently |
| IV. Teach the Why | Motivation before mechanism | ✅ `chapter-authoring` Step 3; `consistency-checker` check 11 |
| V. Predictable Book Structure | 4 modules as folders under `book/docs/`; `sidebar_position`; 4-part chapter | ✅ Structure Decision below; `consistency-checker` check 1 |
| VI. Spec-Driven Development | Spec → plan → tasks → implement; PHR per prompt; ADR by consent | ✅ This plan; tasks follow |

**Post-Phase-1 re-check**: no new violations introduced. Principle II remains conditional and is
tracked below with its resolution path.

## Project Structure

### Documentation (this feature)

```text
specs/001-book/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output — resolved unknowns
├── data-model.md        # Phase 1 output — content entities
├── quickstart.md        # Phase 1 output — how to author one chapter
├── contracts/
│   └── chapter-file-contract.md   # Phase 1 output — the file-level interface
├── verification-log.md  # Created by the first chapter task; tracks example execution status
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/sp.tasks)
```

### Source Code (repository root)

```text
book/
├── docs/
│   ├── intro.mdx                       # sidebar_position: 1, slug: /
│   ├── ros2/                           # Module 1
│   │   ├── _category_.json             # position: 2
│   │   ├── index.mdx                   # module landing page, sidebar_position: 1
│   │   ├── physical-ai-embodied-intelligence.mdx     # 2
│   │   ├── ros2-architecture.mdx                     # 3
│   │   ├── python-agents-rclpy.mdx                   # 4
│   │   └── urdf-describing-a-humanoid.mdx            # 5
│   ├── digital-twin/                   # Module 2 — _category_.json position: 3
│   │   ├── index.mdx
│   │   ├── gazebo-setup-and-basics.mdx
│   │   ├── physics-gravity-collisions.mdx
│   │   ├── simulating-sensors.mdx
│   │   └── unity-visualization.mdx
│   ├── isaac/                          # Module 3 — _category_.json position: 4
│   │   ├── index.mdx
│   │   ├── isaac-sim-synthetic-data.mdx
│   │   ├── isaac-ros-visual-slam.mdx
│   │   └── nav2-path-planning-for-bipeds.mdx
│   └── vla/                            # Module 4 — _category_.json position: 5
│       ├── index.mdx
│       ├── voice-to-action-whisper.mdx
│       ├── cognitive-planning-with-llms.mdx
│       └── capstone-autonomous-humanoid.mdx
├── sidebars.ts                         # unchanged — autogenerated from filesystem
└── docusaurus.config.ts                # unchanged except trailingSlash (see research.md R4)
```

**Structure Decision**: One folder per module directly under `book/docs/`, named by topic slug
with **no numeric prefix**. Ordering is declared explicitly — `position` in each module's
`_category_.json`, `sidebar_position` in every chapter and the introduction — satisfying
Principle V's requirement that order never depend on filename sorting. Because
`routeBasePath: '/'` is set (docs-only mode), URLs read `/ros2/ros2-architecture` with no `/docs/`
segment. `backend/` is untouched by this feature.

## Key decisions

### D1 — Module landing pages are `index.mdx` inside the module folder

Docusaurus treats a doc named `index.mdx` in a category folder as that category's index page
(see research.md R1). This gives each module a clickable landing page carrying its outcome and
prerequisites (FR-005) without hand-writing sidebar entries. `_category_.json` supplies only the
label and position.

### D2 — Ordering is declared twice, at two levels

`_category_.json` `position` orders modules relative to `intro.mdx` (position 1). `sidebar_position`
orders chapters within a module, with the landing page always at 1. No numeric filename prefixes,
so a chapter can be renamed without disturbing order and order can change without renaming files.

### D3 — The introduction replaces the existing placeholder

`book/docs/intro.mdx` currently holds a placeholder. It is rewritten in place, keeping
`slug: /` and `sidebar_position: 1` so the site root stays where it is and no links break.

### D4 — Draft per chapter, review per module

**Per chapter** — two steps:

1. **Draft** — `chapter-writer`, with the `chapter-authoring` skill preloaded. Reads the chapter's
   Catalog entry and the chapters before it; verifies claims against official docs; writes all
   four parts, and self-checks the draft against the skill's checklist before handing off.
2. **Build green** — `npm run build` in `book/` passes with the new chapter in place. A chapter
   that breaks the build is not handed on to the next chapter.

**Per module**, once every chapter in that module is drafted — three steps:

3. **Review, in parallel and independently, across the whole module** — `code-verifier` (syntax,
   real-vs-invented APIs, Jazzy-vs-Lyrical idiom, environment/code agreement) and
   `consistency-checker` (chapter shape, terminology, cross-links, forward references, single
   humanoid, scope). Neither can edit; neither sees the writer's reasoning. Both receive every
   chapter in the module, not one.
4. **Apply fixes** — `chapter-writer` addresses every `blocker` and `major` across the module.
   `minor` findings are a judgement call and are recorded either way.
5. **Re-review if any blocker was fixed** — a fix can introduce a new defect. Scoped to the
   chapters that were changed. Skipped only when the first review returned no blockers.

Reviews run in parallel with each other because they are independent; step 4 waits for both.

**Why review is batched per module.** Running both reviewers after every single chapter exhausted
session token/usage limits before a module could be finished. Batching cuts review invocations for
a four-chapter module from eight to two. The *self-check against the `chapter-authoring` skill*
moves into the drafting step so no chapter is left entirely unexamined between drafts.

**What this does not change.** Every quality gate still runs, with identical criteria: both
reviewers, every `blocker` and `major` fixed, re-review after blocker fixes, build green, the
`drafted` / `verified` split in D5. Only *when* review runs changed — not *whether*.

**The cost, stated plainly.** A defect introduced in chapter *N* can now propagate into chapters
*N+1…* before any reviewer sees it, making the fix wider than it would have been. This is the
accepted trade for finishing modules within session limits. Two things contain it: the writer's
self-check at draft time, and drafting chapters in catalog order so a later chapter builds on an
already self-checked one.

**Exception — Module 1.** Module 1 (Chapters 1.1–1.4, including 1.4) was already reviewed
per chapter under the previous model and keeps that history; it is not re-reviewed as a module.
The per-module model starts at Module 2.

### D5 — The ROS-code execution gap

Principle II requires every example to be executed. **This machine is Windows with no ROS 2,
Gazebo, or Isaac**, so most examples cannot be run during authoring. The plan does not paper over
this — it splits "done" in two:

| State | Meaning |
|---|---|
| `drafted` | Written, reviewed by both agents, all blockers fixed, site builds. Code **not** executed. |
| `verified` | Every example executed in the target environment and producing the stated result. |

Rules:

- Execution status is tracked in `specs/001-book/verification-log.md` — one row per code example:
  chapter, example, status (`executed` / `pending-env` / `blocked`), environment required, date.
- **The marker lives in the repo, not in the chapter.** Readers must not see authoring scaffolding
  (FR-020's spirit). A chapter never claims a result that was not observed — if an example's
  output is unverified, the chapter states what it should produce without asserting it was seen.
- **No chapter is reported "done" while any of its examples is `pending-env`.** Reporting a
  drafted chapter as complete is a defect, not a rounding error.
- A chapter may be *drafted and merged* in `pending-env` state so the book progresses, provided
  the log records it.

**Resolution path**, in preference order:

1. **Docker `osrf/ros:jazzy-desktop` on WSL2** — runs on this Windows machine, covers all of
   Module 1 and headless Gazebo for most of Module 2. Recommended; cheapest to stand up.
2. **Ubuntu 24.04 VM or native install** — covers Modules 1–2 fully, including Gazebo GUI and
   Unity.
3. **A machine with an RTX-class GPU** — the only way to execute Module 3. Cannot be substituted;
   spec Risk 3 already flags that without it, SC-003 is unmeetable for three chapters.

Module 3 is the hard case and its status must be settled before Module 3 authoring begins, not
after it is drafted.

### D6 — Build verification after every module

`npm run build` in `book/` must pass after each module is complete (NFR-004, SC-008). Running it
per-module rather than only at the end keeps the blast radius of a broken link or bad frontmatter
to one module. The build is also run after the scaffolding task, before any chapter exists, to
confirm the skeleton itself is sound.

### D7 — Sequencing follows the spec's user-story priorities

Module 1 (P1) ships complete before Module 2 (P2) starts, and so on. Module 1 is the independently
viable slice; finishing it end-to-end also proves the pipeline, the folder scheme, and the depth
calibration before 10 more chapters are written against them.

Within a module, chapters are written in catalog order — later chapters cross-link to earlier ones,
so writing out of order would produce forward references.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Principle II (Runnable Code Only) cannot be satisfied at authoring time | The development machine is Windows without ROS 2, Gazebo, or Isaac; the target platform is Ubuntu 24.04. Authoring and execution are on different machines | **Write only what can be run here** — would gut Modules 2–4 and produce a book about ROS that never runs ROS. **Block all authoring until an environment exists** — stalls 14 chapters on one unscheduled setup task, and Module 1's examples are the cheapest to re-verify later. Chosen instead: draft with an explicit two-state definition of done (D5), a tracked log, and a prohibition on claiming unobserved results |

## Phase 0 — Research

Complete. See [research.md](./research.md) — R1 category index convention, R2 execution
environment options, R3 Isaac ROS version pinning, R4 `trailingSlash`, R5 MDX vs MD.

## Phase 1 — Design artifacts

Complete:

- [data-model.md](./data-model.md) — content entities, their fields and relationships
- [contracts/chapter-file-contract.md](./contracts/chapter-file-contract.md) — the file-level
  interface every chapter must satisfy (frontmatter schema, section order, naming). This feature
  has no API; the chapter file *is* the contract, and it is what the site build and both review
  agents check against
- [quickstart.md](./quickstart.md) — how to author one chapter end to end

## Phase 2 — Next

`/sp.tasks` generates `tasks.md`. Not created by this command.
