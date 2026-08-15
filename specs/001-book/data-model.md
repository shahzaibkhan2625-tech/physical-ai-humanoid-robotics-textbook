# Phase 1 Data Model: Textbook Content ("book")

**Date**: 2026-08-09 | **Plan**: [plan.md](./plan.md)

This feature has no database. The "data model" is the content structure — the entities the book is
made of, their fields, and the rules that make an instance valid. Both review agents and the site
build check against these rules.

---

## Book

The whole site. Exactly one.

| Field | Value |
|---|---|
| Root | `book/docs/` |
| Introduction | exactly one, at `intro.mdx` |
| Modules | exactly 4, ordered |

**Rules**
- Exactly 4 modules, in spec order (FR-001).
- No chapter file outside a module folder, except the introduction (FR-002).
- No reference to the chatbot, deployment, personalization, or translation as existing (FR-020).
- One humanoid model book-wide, introduced in Chapter 1.4 (FR-017).
- Terminology is stable across modules (FR-018).

---

## Introduction

| Field | Type | Rule |
|---|---|---|
| path | path | `book/docs/intro.mdx` |
| `sidebar_position` | int | `1` |
| `slug` | string | `/` — the site root, docs-only mode |
| audience statement | prose | who the book is for; Python assumed, robotics not |
| module map | prose | how the 4 modules relate |
| end-state | prose | what the reader can build by the end |

Replaces the existing placeholder in place (plan D3). Changing `slug` or `sidebar_position` breaks
the site root.

---

## Module

Exactly 4. Each is a folder.

| Field | Type | Rule |
|---|---|---|
| folder | path | `book/docs/<slug>/`, no numeric prefix |
| label | string | in `_category_.json`; the module title from the spec |
| position | int | in `_category_.json`; `2`–`5` (intro holds `1`) |
| landing page | file | `index.mdx` — category index convention (research R1) |
| outcome | prose | what the reader can do after the module |
| prerequisites | prose | which modules must be read first; hardware and software baseline (FR-019) |
| chapters | ordered list | 4 / 4 / 3 / 3 |

| # | Folder | Position | Chapters |
|---|---|---|---|
| 1 | `ros2/` | 2 | 4 |
| 2 | `digital-twin/` | 3 | 4 |
| 3 | `isaac/` | 4 | 3 |
| 4 | `vla/` | 5 | 3 |

**Relationships**: Module 2 depends on 1; Module 3 on 1–2; Module 4 on 1–3.

---

## Chapter

The atomic unit. Exactly 14, fixed by the Chapter Catalog (FR-004).

| Field | Type | Rule |
|---|---|---|
| path | path | `book/docs/<module>/<slug>.mdx` |
| `sidebar_position` | int | ≥ `2` (landing page holds `1`); matches catalog order |
| `title` | string | exactly the Chapter Catalog title |
| learning objectives | section | part 1 of 4 |
| theory | section | part 2 of 4; motivation before mechanism |
| code example(s) | section | part 3 of 4; 1–2 examples |
| exercises | section | part 4 of 4; 2–4 exercises |
| prose length | int | excluding code: 1,200–2,500 words in Module 1, 1,200–4,500 in Modules 2–4 (NFR-001) |
| execution state | enum | `drafted` \| `verified` (plan D5) |

**Rules**
- All four parts present, in that order (FR-007).
- Objectives match the catalog's "reader can afterwards" line (FR-008).
- Cross-links to earlier chapters instead of re-explaining; no forward references (FR-016).
- Content the catalog lists as out-of-scope for this chapter does not appear.

**State**: `absent` → `drafted` (written, both reviews passed, blockers fixed, build green) →
`verified` (every example executed in the target environment). Only `verified` is done.

---

## Learning objective

| Field | Rule |
|---|---|
| form | a thing the reader will be able to **do** |
| traceability | maps to the chapter's "reader can afterwards" entry (FR-008) |

---

## Code example

One or two per chapter.

| Field | Type | Rule |
|---|---|---|
| language | enum | Python (default) · XML/URDF · YAML · C# (Unity only) · shell |
| environment | prose | ROS 2 distribution, OS, simulator, required packages — stated before the code (FR-011) |
| completeness | bool | runnable as printed; no pseudo-code, no `...`, no invented APIs (FR-010) |
| expected result | prose | what it produces |
| execution status | enum | `executed` \| `pending-env` \| `blocked` |

**Rules**
- ROS 2 examples use `rclpy` with the **Jazzy** init/shutdown idiom; never the context-manager
  form, never `AsyncNode`.
- Every API used exists in Jazzy under that name and signature.
- The stated environment covers everything the code imports and invokes.
- A chapter never asserts an output that was not observed (plan D5).

---

## Exercise

Two to four per chapter.

| Field | Rule |
|---|---|
| solvable with | only material already taught (FR-013) |
| self-check | states what a correct result looks like |
| solution | not published (spec Assumption 7) |

---

## Verification log entry

One row per code example, in `specs/001-book/verification-log.md`. Repo-side only — never
reader-facing.

| Field | Type |
|---|---|
| chapter | path |
| example | identifier |
| status | `executed` \| `pending-env` \| `blocked` |
| environment required | string, e.g. `ros:jazzy-desktop` / `RTX GPU` |
| date checked | date |
| note | free text |

**Rule**: a chapter is `verified` only when every one of its rows reads `executed`.

---

## Review finding

Produced by `code-verifier` and `consistency-checker`. Transient — lives in the task's report, not
in the repo.

| Field | Type |
|---|---|
| source | `code-verifier` \| `consistency-checker` |
| severity | `blocker` \| `major` \| `minor` |
| location | file + line/section |
| defect | prose |
| evidence | source URL (verifier) or quoted conflicting passage (checker) |
| suggested fix | prose — described, never applied by the reviewer |

**Rule**: every `blocker` and `major` is resolved before a chapter reaches `drafted`. A finding
without evidence is not actionable and is sent back.
