---
description: "Task list for feature 001-book — textbook content"
---

# Tasks: Textbook Content ("book")

**Input**: Design documents from `/specs/001-book/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/chapter-file-contract.md](./contracts/chapter-file-contract.md),
[quickstart.md](./quickstart.md)

**Tests**: No automated test tasks. This is a content feature; its verification gates are
`npm run build`, the two review agents, and per-example execution in a ROS 2 Jazzy environment.

**Organization**: One phase per user story, in spec priority order. Module 1 (P1) completes before
Module 2 (P2) starts (plan D7).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1–US4, mapping to the spec's user stories
- Every task names its exact file path

## The authoring loop — draft per chapter, review per module

Drafting is per chapter; review is batched once per module (plan D4). Reason: running both
reviewers after every chapter exhausted session token/usage limits. Every gate still runs with
identical criteria — only *when* review runs changed, not *whether*.

**Every chapter task** expands into two steps:

1. **Draft** — `chapter-writer` (has `chapter-authoring` preloaded), one chapter only, self-checked
   against the skill's checklist before handoff
2. **Build green** — `npm run build` in `book/` passes with the new chapter in place

**Every module has one review task**, run after all its chapters are drafted:

3. **Review** — `code-verifier` **and** `consistency-checker`, launched together, fresh context,
   neither can edit, both scoped to **every chapter in the module**
4. **Fix** — `chapter-writer` resolves every `blocker` and `major`; `minor` is a judgement call,
   recorded either way
5. **Re-review** — only if a blocker was fixed; scoped to the changed chapters

A module reaching the end of this loop is **`drafted`**, not done. Its chapters become
**`verified`** only when every one of their examples has been executed (plan D5).

**Module 1 is the exception**: Chapters 1.1–1.4 were reviewed per chapter under the previous model
and keep that history. The per-module model applies from Module 2 onward.

## Path conventions

Content lives under `book/docs/`. Tracking lives under `specs/001-book/`. `backend/` is untouched.

---

## Phase 1: Setup

**Purpose**: Tracking and a known-good baseline before any content changes

- [ ] T001 Create `specs/001-book/verification-log.md` with the columns from data-model.md
      (chapter, example, status, environment required, date checked, note) and an empty table
- [ ] T002 [P] Record the baseline: run `npm run build` in `book/` and confirm it passes before any
      content change, so a later failure is attributable
- [ ] T003 [P] **Optional, user decision** — set `trailingSlash: true` in `book/docusaurus.config.ts`
      per research.md R4. Skip if declining; do not change any other config field

**Checkpoint**: Tracking exists, build is green.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The introduction establishes audience, scope, and the terminology every chapter
inherits. Writing it first stops terminology drift instead of correcting it 14 chapters later.

**⚠️ No chapter work begins until this phase completes.**

- [ ] T004 Rewrite `book/docs/intro.mdx`, replacing the placeholder in place. Keep
      `sidebar_position: 1` and `slug: /` unchanged — both are load-bearing for the site root.
      Must state: who the book is for (Python assumed, robotics not), the target platform
      (ROS 2 Jazzy · Ubuntu 24.04 · Gazebo Harmonic), how the 4 modules relate, and what the reader
      can build by the end (FR-006)
- [ ] T005 Run `npm run build` in `book/`; confirm the site root still resolves to the introduction

**Checkpoint**: Introduction live, root intact — chapter work can begin.

---

## Phase 3: User Story 1 — Module 1, ROS 2 (Priority: P1) 🎯 MVP

**Goal**: A reader who knows Python can write and run their own `rclpy` node and describe a
humanoid in URDF.

**Independent Test**: Navigate intro → 1.1 → 1.2 → 1.3 → 1.4 in order; every chapter has all four
parts; a reader with ROS 2 Jazzy can execute each example.

**Review model — historical exception.** Every chapter in this phase, 1.4 included, ran
`code-verifier` and `consistency-checker` **per chapter** under the previous model. That work
stands; Module 1 is not re-reviewed as a module and has no module-review task. "Run the
per-chapter loop" below records what was done. Modules 2–4 use the per-module model (plan D4).

- [ ] T006 [US1] Scaffold `book/docs/ros2/` — create the folder and `_category_.json` with
      `{"label": "Module 1 — ROS 2: The Robotic Nervous System", "position": 2}`, plus
      `book/docs/ros2/index.mdx` (`sidebar_position: 1`) stating the module outcome and
      prerequisites (FR-005, FR-019). Create folder, `_category_.json`, and landing page in one
      task — a category folder with no documents in it breaks the autogenerated sidebar
- [ ] T007 [US1] Chapter 1.1 → `book/docs/ros2/physical-ai-embodied-intelligence.mdx`
      (`sidebar_position: 2`). Run the per-chapter loop. Code example is plain Python
      sense–think–act, no ROS yet — so it is executable on this machine; mark it `executed`
- [ ] T008 [US1] Chapter 1.2 → `book/docs/ros2/ros2-architecture.mdx` (`sidebar_position: 3`).
      Run the per-chapter loop. Name that a third primitive (actions) exists; do not teach it —
      it belongs to Chapter 3.3
- [ ] T009 [US1] Chapter 1.3 → `book/docs/ros2/python-agents-rclpy.mdx` (`sidebar_position: 4`).
      Run the per-chapter loop. This chapter defines the agent-node skeleton every later module
      reuses — the Jazzy init/shutdown idiom set here propagates book-wide
- [ ] T010 [US1] Chapter 1.4 → `book/docs/ros2/urdf-describing-a-humanoid.mdx`
      (`sidebar_position: 5`). Run the per-chapter loop. **Produces the single humanoid model used
      for the rest of the book (FR-017)** — every later module depends on this output
- [ ] T011 [US1] Module 1 build + ordering check: run `npm run build` in `book/`, then confirm the
      rendered sidebar reads intro → 1.1 → 1.2 → 1.3 → 1.4 and that no ordering depends on
      filename sort
- [ ] T012 [US1] Reconcile `specs/001-book/verification-log.md` — one row per Module 1 example.
      Report how many are `executed` vs `pending-env`

**Checkpoint**: Module 1 is `drafted` and independently useful. **Do not start Module 2 until this
checkpoint passes** — Module 1 is what proves the pipeline, the folder scheme, and the depth
calibration before 10 more chapters are written against them.

---

## Phase 4: User Story 2 — Module 2, Gazebo & Unity (Priority: P2)

**Goal**: The reader can stand the humanoid up in physics simulation, understand why it behaves as
it does, and read simulated sensor data from ROS 2.

**Independent Test**: With Modules 1–2 present, a reader goes from the URDF to a simulated robot
publishing sensor topics, verified by inspecting those topics.

- [ ] T013 [US2] Scaffold `book/docs/digital-twin/` — folder, `_category_.json`
      `{"label": "Module 2 — Gazebo & Unity: The Digital Twin", "position": 3}`, and `index.mdx`
      (`sidebar_position: 1`) stating outcome and prerequisites (Module 1)
- [ ] T014 [US2] Chapter 2.1 → `book/docs/digital-twin/gazebo-setup-and-basics.mdx`
      (`sidebar_position: 2`). **Draft + build green.** Must spawn the **Chapter 1.4 humanoid** —
      the book does not switch robots
- [ ] T015 [US2] Chapter 2.2 → `book/docs/digital-twin/physics-gravity-collisions.mdx`
      (`sidebar_position: 3`). **Draft + build green.** Explain *why* the biped falls; do not
      solve balance control — the catalog lists it as out of scope
- [ ] T016 [US2] Chapter 2.3 → `book/docs/digital-twin/simulating-sensors.mdx`
      (`sidebar_position: 4`). **Draft + build green.** Sensor fusion belongs to Module 3
- [ ] T017 [US2] Chapter 2.4 → `book/docs/digital-twin/unity-for-visualization.mdx`
      (`sidebar_position: 5`). **Draft + build green.** Python side is the focus; C# only as far
      as needed to see it work
- [ ] T017a [US2] **Module 2 review** — after T014–T017 are all drafted. Launch `code-verifier`
      **and** `consistency-checker` together, fresh context, each scoped to all four Module 2
      chapters plus `index.mdx`. Then `chapter-writer` applies every `blocker` and `major`;
      `minor` is a judgement call, recorded either way. Re-review any chapter whose blocker was
      fixed. Same gates as the old per-chapter review — only the batching changed (plan D4)
- [ ] T018 [US2] Module 2 build + ordering check: `npm run build` in `book/`; confirm module order
      is intro → Module 1 → Module 2
- [ ] T019 [US2] Reconcile `verification-log.md` for Module 2 examples

**Checkpoint**: Modules 1–2 `drafted`, both independently navigable.

---

## Phase 5: User Story 3 — Module 3, NVIDIA Isaac (Priority: P3)

**Goal**: The reader can explain — and with the required hardware, run — the perception and
navigation stack.

**Independent Test**: A reader without an RTX GPU can read every chapter and state what synthetic
data, SLAM, and Nav2 each do; a reader with the hardware can run the examples.

- [ ] T020 [US3] **Gate — settle before drafting.** Confirm whether RTX-class GPU access exists
      (Isaac ROS needs CUDA 13.0+, driver 580+, Ubuntu 24.04). Re-confirm the Isaac ROS release
      line (research.md R3 targets `release-4.5`). If no GPU is available, record the decision and
      its consequence explicitly: SC-003 cannot be met for three chapters, and that is a scope
      reduction for the user to accept — not something to discover after drafting
- [ ] T021 [US3] Scaffold `book/docs/isaac/` — folder, `_category_.json`
      `{"label": "Module 3 — NVIDIA Isaac: The AI-Robot Brain", "position": 4}`, and `index.mdx`
      (`sidebar_position: 1`) stating outcome, prerequisites (Modules 1–2), **and the GPU
      requirement up front** (FR-019)
- [ ] T022 [US3] Chapter 3.1 → `book/docs/isaac/isaac-sim-synthetic-data.mdx`
      (`sidebar_position: 2`). **Draft + build green.** State the hardware requirement in the
      opening; theory must stand alone without the GPU
- [ ] T023 [US3] Chapter 3.2 → `book/docs/isaac/isaac-ros-visual-slam.mdx` (`sidebar_position: 3`).
      **Draft + build green.** Must cover failure modes (featureless walls, motion blur, drift,
      loop closure) — a reader who does not know these will misdiagnose every failure
- [ ] T024 [US3] Chapter 3.3 → `book/docs/isaac/nav2-path-planning-for-bipeds.mdx`
      (`sidebar_position: 4`). **Draft + build green.** **ROS 2 actions are introduced here** —
      first place they have a real use. Must state what changes for a biped versus a wheeled base
- [ ] T024a [US3] **Module 3 review** — after T022–T024 are all drafted. Launch `code-verifier`
      **and** `consistency-checker` together, fresh context, each scoped to all three Module 3
      chapters plus `index.mdx`. Then `chapter-writer` applies every `blocker` and `major`;
      `minor` is a judgement call, recorded either way. Re-review any chapter whose blocker was
      fixed. `code-verifier` carries extra weight here — Isaac examples that cannot be executed
      (T020) have static review as their only check
- [ ] T025 [US3] Module 3 build + ordering check: `npm run build` in `book/`
- [ ] T026 [US3] Reconcile `verification-log.md` for Module 3. Any example needing a GPU that was
      not available is `blocked`, not `pending-env` — the distinction matters, because `blocked`
      has no scheduled resolution

**Checkpoint**: Modules 1–3 `drafted`. Module 3's execution status is explicitly recorded.

---

## Phase 6: User Story 4 — Module 4, Vision-Language-Action (Priority: P4)

**Goal**: The reader can connect spoken instructions to validated robot action and assemble the
whole book into one system.

**Independent Test**: With all four modules present, a reader traces one spoken instruction
end-to-end through every layer the book taught.

- [ ] T027 [US4] Scaffold `book/docs/vla/` — folder, `_category_.json`
      `{"label": "Module 4 — Vision-Language-Action (VLA)", "position": 5}`, and `index.mdx`
      (`sidebar_position: 1`) stating outcome and prerequisites (Modules 1–3)
- [ ] T028 [US4] Chapter 4.1 → `book/docs/vla/voice-to-action-whisper.mdx`
      (`sidebar_position: 2`). **Draft + build green.** Must explain why the command set is
      bounded — a robot acting on a misheard word is a safety problem, not a UX one
- [ ] T029 [US4] Chapter 4.2 → `book/docs/vla/cognitive-planning-with-llms.mdx`
      (`sidebar_position: 3`). **Draft + build green.** Must cover grounding and **plan validation
      before dispatch**
- [ ] T030 [US4] Chapter 4.3 → `book/docs/vla/capstone-autonomous-humanoid.mdx`
      (`sidebar_position: 4`). **Draft + build green.** **Introduces no new concepts** — every
      component must cite the chapter that taught it. Depends on all 13 preceding chapters
- [ ] T030a [US4] **Module 4 review** — after T028–T030 are all drafted. Launch `code-verifier`
      **and** `consistency-checker` together, fresh context, each scoped to all three Module 4
      chapters plus `index.mdx`. Then `chapter-writer` applies every `blocker` and `major`;
      `minor` is a judgement call, recorded either way. Re-review any chapter whose blocker was
      fixed. `consistency-checker` must confirm the capstone cites the teaching chapter for every
      component and introduces nothing new
- [ ] T031 [US4] Module 4 build + ordering check: `npm run build` in `book/`; confirm all five
      sidebar entries in order
- [ ] T032 [US4] Reconcile `verification-log.md` for Module 4

**Checkpoint**: All 14 chapters `drafted`.

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: Whole-book checks that only make sense once every chapter exists

- [ ] T033 Book-wide terminology sweep with `consistency-checker` across all 14 chapters — one term
      per concept, one concept per term (FR-018). Cannot be done per-chapter; drift is only visible
      across the whole book
- [ ] T034 Book-wide cross-link audit: every internal link resolves, no forward references, no
      concept explained twice (FR-016). `onBrokenLinks: 'throw'` catches dead links; it does not
      catch a link that points somewhere valid but wrong
- [ ] T035 Verify the single humanoid model is used book-wide with no silent substitution (FR-017,
      SC-010)
- [ ] T036 Confirm zero references to the chatbot, deployment, personalization, or translation as
      existing features (FR-020, SC-012)
- [ ] T037 **Close the execution gap** — stand up the ROS 2 Jazzy environment (research.md R2,
      preferred: `osrf/ros:jazzy-desktop` under WSL2), run every `pending-env` example, and flip
      its row to `executed`. Until this task completes, **no chapter is `verified` and the book is
      not done** (Principle II)
- [ ] T038 Final full build: `npm run build` in `book/`, zero errors and zero new warnings (SC-008),
      then walk the whole sidebar top to bottom confirming SC-001 (all 4 modules, all 14 chapters,
      correct order)

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 (Setup)** — no dependencies
- **Phase 2 (Foundational)** — after Setup; **blocks all chapter work**
- **Phase 3 (US1)** — after Foundational
- **Phase 4 (US2)** — after Phase 3 checkpoint
- **Phase 5 (US3)** — after Phase 4 checkpoint; T020 gates the rest of the phase
- **Phase 6 (US4)** — after Phase 5 checkpoint
- **Phase 7 (Polish)** — after all four story phases

Within Phases 4–6, the module review task (T017a / T024a / T030a) depends on **every** chapter task
in its phase and **blocks that phase's checkpoint**. A module is not `drafted` until its review has
run and its blockers and majors are fixed.

### Why the story phases are sequential here

The spec's user stories are independently *testable*, but the chapters are not independently
*writable*. Later chapters cross-link to earlier ones and reuse the Chapter 1.4 humanoid, so
writing out of order manufactures forward references — exactly what FR-016 forbids. Module order
follows plan D7 and spec priority; chapter order within a module follows the Catalog.

### Content dependencies worth naming

| Task | Produces | Depended on by |
|---|---|---|
| T004 | Terminology and audience baseline | every chapter |
| T009 (Ch 1.3) | The agent-node skeleton and Jazzy idiom | every later `rclpy` example |
| T010 (Ch 1.4) | **The single humanoid model** | T014–T017, T022–T024, T030 |
| T024 (Ch 3.3) | ROS 2 actions | T030 |
| T007–T029 | All 13 preceding chapters | T030 (capstone) |

### Parallel opportunities — genuinely limited

Real parallelism in this feature is **within** the module review task, not across tasks:

- `code-verifier` and `consistency-checker` always run **together** on a drafted module (T017a,
  T024a, T030a). They are independent of each other and of the writer; running them serially
  wastes the main win
- T002 and T003 in Setup are independent of each other

Everything else is sequential by content dependency. Marking chapter tasks `[P]` would be
dishonest — two chapters written in parallel cannot cross-link to each other correctly.

**One exception, if two people are working**: T037 (execution) can proceed on Module 1's examples
while Module 2 is being drafted, because execution reads finished chapters and does not modify
them.

---

## Parallel Example: one module, drafted then reviewed

```text
# Chapter tasks — one agent each, sequential, build green after each
Task: "Use chapter-writer to draft Chapter 2.1 → book/docs/digital-twin/gazebo-setup-and-basics.mdx"
Task: "Use chapter-writer to draft Chapter 2.2 → book/docs/digital-twin/physics-gravity-collisions.mdx"
Task: "Use chapter-writer to draft Chapter 2.3 → book/docs/digital-twin/simulating-sensors.mdx"
Task: "Use chapter-writer to draft Chapter 2.4 → book/docs/digital-twin/unity-for-visualization.mdx"

# Module review task (T017a) — both reviewers launched together in one message
Task: "Use code-verifier on all chapters in book/docs/digital-twin/"
Task: "Use consistency-checker on all chapters in book/docs/digital-twin/"

# Fix (single agent, after both reports return)
Task: "Use chapter-writer to apply the blocker and major findings across Module 2"
```

---

## Implementation Strategy

### MVP (User Story 1 only)

1. Phase 1 Setup → 2. Phase 2 Foundational → 3. Phase 3 Module 1
4. **STOP and validate**: read intro → 1.1 → 1.2 → 1.3 → 1.4 as a reader would
5. A reader who stops after Module 1 has still learned a complete skill — this is a shippable slice

### Incremental delivery

Setup + Foundational → Module 1 (MVP) → Module 2 → Module 3 → Module 4 → Polish. Each module
checkpoint is a demo point.

### Three things that will bite if ignored

1. **T020 before Module 3 drafting, not after.** Without GPU access, three chapters cannot reach
   `verified`. Discovering that after drafting wastes the drafting.
2. **T037 is not optional polish.** Every chapter sits at `drafted` until its examples run. A book
   reported "complete" with unexecuted code violates Principle II — the honest status is
   "14 chapters drafted, N examples pending execution."
3. **The module review task is not skippable, and deferring it costs more the later it runs.**
   Batching review per module means a defect in chapter *N* can propagate into *N+1…* before any
   reviewer sees it. Budget usage so the review task actually runs at the end of its module —
   carrying it into the next module is how four unreviewed chapters become eight.

---

## Notes

- 41 tasks: 3 setup, 2 foundational, 7 US1, 8 US2, 8 US3, 7 US4, 6 polish
- 14 chapter tasks (T007–T010, T014–T017, T022–T024, T028–T030), one per catalog chapter
- 3 module review tasks (T017a, T024a, T030a) — Modules 2, 3, 4. Module 1 has none: it was
  reviewed per chapter under the previous model (plan D4 exception)
- 4 module scaffolds (T006, T013, T021, T027), each bundling folder + `_category_.json` + landing page
- 4 per-module build checks (T011, T018, T025, T031) plus baseline (T002), post-intro (T005), final (T038)
- Commit after each task
- A task is complete only when its stated file exists and the build is green — not when a draft
  "looks finished"
