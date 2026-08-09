# Quickstart: Authoring One Chapter

**Date**: 2026-08-09 | **Plan**: [plan.md](./plan.md)

How to take one chapter from absent to drafted. Repeat per chapter; never batch.

---

## Before you start

Confirm all four exist:

| Thing | Where |
|---|---|
| Chapter's scope and reader outcome | `specs/001-book/spec.md` → Chapter Catalog |
| Authoring procedure | `.claude/skills/chapter-authoring/SKILL.md` |
| File-level rules | `specs/001-book/contracts/chapter-file-contract.md` |
| Module folder + `_category_.json` | `book/docs/<module>/` — scaffolded before chapter 1 |

Target platform is fixed: **ROS 2 Jazzy · Ubuntu 24.04 · Gazebo Harmonic**.

---

## Step 1 — Draft

Invoke `chapter-writer` for exactly one chapter. It has the `chapter-authoring` skill preloaded.

```
Use chapter-writer to draft Chapter 1.2 (ROS 2 Architecture: Nodes, Topics, Services).
```

It will read the catalog entry, read the earlier chapters, verify claims against official docs,
and write all four parts.

**Expect it to report unexecuted examples.** This machine has no ROS 2 (plan D5). That is the
designed behaviour, not a failure.

## Step 2 — Review, in parallel

Run both reviewers on the drafted file. They are independent of the writer and of each other, so
launch them together:

```
Use code-verifier and consistency-checker on book/docs/ros2/ros2-architecture.mdx
```

| Agent | Checks | Cannot |
|---|---|---|
| `code-verifier` | syntax, imports, real-vs-invented APIs, Jazzy-vs-Lyrical idiom, environment/code agreement | edit |
| `consistency-checker` | chapter shape, objectives-vs-catalog, terminology, cross-links, forward references, single humanoid, depth | edit |

Each returns findings with a severity and evidence.

## Step 3 — Apply fixes

Hand the findings back to `chapter-writer`.

- **`blocker` and `major`** — must be fixed.
- **`minor`** — judgement call; record the decision either way.
- A finding with no evidence is not actionable — send it back rather than acting on it.

## Step 4 — Re-review if a blocker was fixed

A fix can introduce a new defect. Re-run the reviewer that raised the blocker. Skip only when the
first pass returned no blockers.

## Step 5 — Build

```
cd book
npm run build
```

Must pass. `onBrokenLinks: 'throw'` means a bad internal link fails here.

## Step 6 — Record execution status

Add one row per code example to `specs/001-book/verification-log.md`:

| chapter | example | status | environment required | date | note |
|---|---|---|---|---|---|
| `ros2/ros2-architecture.mdx` | talker/listener | `pending-env` | `osrf/ros:jazzy-desktop` | 2026-08-09 | |

The chapter is now **`drafted`**. It is **not done**.

---

## Reaching `verified`

Run every `pending-env` example in a ROS 2 Jazzy environment, confirm it produces the stated
result, and flip its row to `executed`. Preferred environment (research R2):

```bash
docker run -it --rm -v "$PWD:/work" osrf/ros:jazzy-desktop bash
```

Covers Module 1 fully and headless Gazebo for most of Module 2. Module 3 needs an RTX-class GPU
and has no software substitute — settle that before Module 3 authoring starts.

A chapter is `verified` when every one of its log rows reads `executed`. Only then is it done.

---

## Rules that are easy to get wrong

1. **One chapter per invocation.** Batching defeats independent review.
2. **In catalog order.** Writing out of order produces forward references.
3. **Never report a drafted chapter as done.** Unrun code is a gap to hand back, not to round off.
4. **Never state an output that was not observed.** Say what an example should produce; do not
   assert it was seen.
5. **Reviewers do not edit.** If one offers to apply a fix, it has exceeded its role.
6. **A chapter over the word budget gets split, not trimmed** — and splitting changes the Chapter
   Catalog, so it needs a spec update first.
