# Contract: Chapter File

**Date**: 2026-08-09 | **Plan**: [plan.md](./plan.md)

This feature exposes no API. Its interface is the **file on disk** — what the Docusaurus build
consumes, what `code-verifier` and `consistency-checker` check, and what a later feature (the RAG
chatbot's ingestion, spec `002-chatbot`) will parse for chunking and citation.

A file that violates this contract is a defect regardless of how well it reads.

---

## 1. Location and naming

```
book/docs/<module-slug>/<chapter-slug>.mdx
```

| Rule | Requirement |
|---|---|
| Extension | `.mdx` — no `.md` (research R5) |
| Chapter slug | lowercase, hyphen-separated, no numeric prefix |
| Module slug | one of `ros2`, `digital-twin`, `isaac`, `vla` |
| Landing page | `index.mdx` in the module folder (research R1) |
| Introduction | `book/docs/intro.mdx` only |

Numeric filename prefixes are prohibited — ordering is metadata, not filename (Principle V).

---

## 2. Frontmatter

### Chapter

```yaml
---
sidebar_position: <int ≥ 2>
title: <exact Chapter Catalog title>
---
```

| Field | Required | Rule |
|---|---|---|
| `sidebar_position` | yes | ≥ 2 (landing page holds 1). Matches catalog order within the module. Unique within the folder |
| `title` | yes | Character-for-character the Chapter Catalog title |

### Module landing page (`index.mdx`)

```yaml
---
sidebar_position: 1
title: <module title>
---
```

### Introduction (`intro.mdx`)

```yaml
---
sidebar_position: 1
slug: /
---
```

`slug: /` is load-bearing — it makes the introduction the site root under `routeBasePath: '/'`.
Do not remove it.

### Module `_category_.json`

```json
{
  "label": "<module title>",
  "position": <2..5>
}
```

No other keys. Positions 2–5 across the four modules; `intro.mdx` holds 1 at the same level.

---

## 3. Section structure

Exactly four parts, in this order (FR-007, Principle V):

| # | Section | Requirement |
|---|---|---|
| 1 | Learning objectives | List of things the reader will be able to **do**. Matches the catalog's "reader can afterwards" line |
| 2 | Theory | Motivation before mechanism. Why it exists and what breaks without it, before how to use it |
| 3 | Code example(s) | One or two. Each preceded by its environment statement |
| 4 | Exercises | Two to four, solvable from material already taught, each with a self-check description |

A file missing any part, or ordering them differently, fails the contract.

---

## 4. Code block requirements

Every code example carries, immediately before the block:

- ROS 2 distribution (**Jazzy**), OS (**Ubuntu 24.04**), simulator version where relevant
- Packages the reader must install
- What the example produces

Every fenced block declares its language (` ```python `, ` ```xml `, ` ```bash `, ` ```yaml `,
` ```csharp `).

**Prohibited in any example**: pseudo-code · `...` standing in for logic · `# TODO` ·
"left as an exercise" inside an example · invented APIs · APIs that exist only outside Jazzy.

**Prohibited `rclpy` forms** (Lyrical-era, not Jazzy):

```python
with rclpy.init(args=args):                            # ✗
from rclpy.executors import ExternalShutdownException  # ✗
from rclpy.experimental import AsyncNode               # ✗
```

**Required `rclpy` form**: `rclpy.init(args=args)` … `node.destroy_node()` … `rclpy.shutdown()`.

---

## 5. Linking

| Rule | Requirement |
|---|---|
| Cross-links | Relative links to other chapters. A concept taught earlier is linked, never re-explained (FR-016) |
| Forward references | Prohibited — no chapter depends on material taught later |
| Link integrity | Every internal link resolves. `onBrokenLinks: 'throw'` makes a broken link fail the build |
| External links | Official documentation only, for claims the reader may want to check |

---

## 6. Prohibited content

- Any reference to the chatbot, deployment, personalization, or translation as existing (FR-020)
- Authoring scaffolding visible to readers — TODOs, review notes, execution-status markers.
  Execution status lives in `specs/001-book/verification-log.md` (plan D5)
- A stated output that was not actually observed
- A second robot model. The Chapter 1.4 humanoid is the book's robot (FR-017)

---

## 7. Acceptance

A chapter file satisfies this contract when all of these hold:

- [ ] Correct path, extension, and slug form
- [ ] Frontmatter present, `sidebar_position` unique within the folder and matching catalog order
- [ ] `title` matches the Chapter Catalog exactly
- [ ] Four sections present, in order
- [ ] Every code block declares a language and is preceded by an environment statement
- [ ] No prohibited code forms; `rclpy` uses the Jazzy idiom
- [ ] No forward references; cross-links resolve
- [ ] Prose 1,200–2,500 words excluding code
- [ ] 2–4 exercises with self-check descriptions
- [ ] `npm run build` in `book/` passes
- [ ] Every example has a row in `verification-log.md`

Items 1–9 are checked by `consistency-checker` and `code-verifier`. Item 10 is the build gate.
Item 11 is the writer's responsibility and is what separates `drafted` from `verified`.
