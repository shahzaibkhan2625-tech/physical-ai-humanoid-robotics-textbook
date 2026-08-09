---
name: chapter-authoring
description: Write or revise a chapter of the Physical AI & Humanoid Robotics textbook in book/docs/. Enforces the constitution's 4-part chapter shape, the ROS 2 Jazzy target, runnable-code and doc-verification rules, and the chapter's scope as fixed in specs/001-book/spec.md. Use when writing, drafting, revising, or reviewing any book chapter or module landing page.
when_to_use: Trigger on requests like "write chapter 1.2", "draft the URDF chapter", "revise the Gazebo chapter", "review this chapter against the constitution", or any edit to files under book/docs/.
argument-hint: [chapter number or title, e.g. 1.2]
---

# Chapter authoring

Write one chapter, completely, to the standard below. Do not batch chapters — one chapter per
invocation, so each stays independently reviewable.

## Step 1 — Load the chapter's contract before writing

Two files are authoritative. Read both; do not write from memory of them.

1. `specs/001-book/spec.md` → **Chapter Catalog**. Find this chapter's entry. It fixes:
   - what the chapter covers, and what is deliberately **out of scope** (respect this — the
     out-of-scope list is the depth control, not an oversight)
   - the code example's subject
   - the **"reader can afterwards"** line — the chapter's acceptance test
2. `.specify/memory/constitution.md` → Principles I–V and the chapter quality gates.

Also read the module's prerequisites line in the catalog, and skim the chapters before this one
so you know what has already been taught.

If the chapter is not in the catalog, stop and say so. Adding a chapter requires a spec change
first (FR-004).

## Step 2 — Placement and frontmatter

Chapters are MDX files inside their module's folder under `book/docs/`. Never at the docs root
(only the introduction lives there).

```
book/docs/
  intro.mdx
  <module-folder>/
    _category_.json      ← module label + position
    <chapter-slug>.mdx
```

Every chapter file starts with:

```yaml
---
sidebar_position: <n>
title: <Chapter title exactly as in the Chapter Catalog>
---
```

Rules:

- `sidebar_position` orders chapters **within** the module and must match the catalog's order.
  Never rely on filename sorting (FR-003).
- Module folder order comes from `_category_.json`, not from the folder name.
- Filenames are lowercase, hyphenated, no numeric prefixes.
- Check the existing folder and `_category_.json` before creating new ones; match what is there.

## Step 3 — Write the four parts, in this order

A chapter missing any part is not complete (Principle V). Order is fixed.

**1. Learning objectives.** A short list, each an action the reader will be able to *do*. These
must match the catalog's "reader can afterwards" line — no promising more, no drifting elsewhere.

**2. Theory.** Motivation before mechanism, always (Principle IV). Open with the problem this
thing solves and what goes wrong without it; only then explain how it works. A sequence of steps
with no stated reason is an incomplete chapter, not a terse one.

**3. Code example(s).** One or two. See Step 4.

**4. Exercises.** Two to four short tasks, solvable with only what this chapter and its
prerequisites taught. State what a correct result looks like so the reader can self-check.
Do not publish solutions. Never require assets, packages, or services the book has not introduced.

## Step 4 — Code rules

**Target platform is fixed** (spec Assumption 2, confirmed 2026-08-09):

| | |
|---|---|
| ROS 2 | Jazzy Jalisco |
| OS | Ubuntu 24.04 (Noble) |
| Simulator | Gazebo Harmonic |

Every example states the environment it assumes — ROS 2 distribution, OS, simulator, and any
packages the reader must install — before the code (FR-011).

**Runnable as printed** (Principle II, non-negotiable). No pseudo-code, no `...` standing in for
logic, no invented APIs, no "left as an exercise" inside an example. If an example cannot be made
runnable, replace it with one that can — never downgrade it to a sketch.

**Run every example before publishing.** An example you have not executed is not finished.

**Python everywhere a choice exists**; ROS 2 examples use `rclpy`. Other languages only where the
tool requires it (URDF/XML, C# for Unity, YAML, shell).

### Jazzy rclpy idiom — use this

```python
import rclpy
from rclpy.node import Node


class MyNode(Node):
    def __init__(self):
        super().__init__('my_node')
        # create_publisher / create_subscription / create_timer as needed


def main(args=None):
    rclpy.init(args=args)
    node = MyNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()


if __name__ == '__main__':
    main()
```

### Never use these — they are Lyrical-era, not Jazzy

```python
with rclpy.init(args=args):          # ✗ context-manager form
from rclpy.executors import ExternalShutdownException   # ✗ not the Jazzy example idiom
from rclpy.experimental import AsyncNode                # ✗ does not exist in Jazzy
```

Current ROS 2 examples found online default to the newer idiom. Copying one silently produces
code that fails on the book's target. The `Node` API itself — `create_publisher`,
`create_subscription`, `create_timer`, `spin`, `get_logger` — is unchanged, so only the
init/shutdown block differs.

## Step 5 — Verify against official docs, not memory

Writing robotics content from model memory is prohibited (Principle III). Verify before you
write, for this distribution:

- API names and signatures
- CLI invocations and their flags
- package and distribution names
- version-specific behaviour

Name the version for any version-dependent claim (FR-014).

Sources, in order of preference:

| Topic | Source |
|---|---|
| ROS 2 / rclpy | `docs.ros.org/en/jazzy/` |
| Canonical rclpy code | `github.com/ros2/examples` — **the `jazzy` branch** |
| Gazebo | `gazebosim.org` |
| ROS ↔ Gazebo bridge | `gazebosim.org` `ros_installation` pairing table |
| Isaac Sim / Isaac ROS | `docs.isaacsim.omniverse.nvidia.com`, `nvidia-isaac-ros.github.io` |
| Nav2 | `docs.nav2.org` |
| Unity ROS integration | Unity Robotics Hub documentation |
| Whisper / VLA | model cards and primary papers |

**Known obstacle:** `docs.ros.org` blocks automated fetches (Anubis anti-bot) and returns Access
Denied. When it does, use the `ros2/examples` and `ros2/ros2_documentation` GitHub repositories on
the `jazzy` branch instead — same content, reachable. Say when a source was unreachable; never
fill the gap with a guess.

If a source contradicts the spec's planned scope, the source wins. Write what is true and flag
the divergence.

## Step 6 — Fit with the rest of the book

- **Cross-link, never re-teach.** A concept explained in an earlier chapter gets a link, not a
  second explanation (FR-016).
- **Never forward-reference** material as a prerequisite. If you need something not yet taught,
  either the chapter order is wrong or the concept belongs here.
- **One humanoid.** The URDF model authored in Chapter 1.4 is the robot for the whole book
  (FR-017). Do not introduce a different robot.
- **Consistent terminology.** A term named one way in Module 1 keeps that name in Module 4.
- **Actions** (the third ROS 2 primitive) are introduced in Chapter 3.3, not earlier. Chapter 1.2
  only names that a third primitive exists.
- **Never reference** the chatbot, deployment, personalization, or translation as existing
  features (FR-020).

## Step 7 — Depth

Moderate, leaning light. Roughly **1,200–2,500 words of prose** excluding code; 15–25 minutes of
reading. This is a review signal, not a hard gate.

The reader knows Python and nothing about robotics. Do not re-teach Python. Do not assume ROS,
simulation, or control theory.

If the chapter will not fit the budget, that is a signal to **split it into two short chapters**,
not to expand this one — and splitting changes the catalog, so raise it rather than doing it
silently.

## Step 8 — Done means all of these

Check each before reporting the chapter complete:

- [ ] Learning objectives, theory, code example(s), exercises — present, in that order
- [ ] Objectives match the catalog's "reader can afterwards" line
- [ ] Every code example has been **executed** and produces the stated result
- [ ] Every example states its assumed environment and versions
- [ ] rclpy code uses the Jazzy idiom; no context-manager init, no `AsyncNode`
- [ ] Robotics claims verified against official docs; versions named
- [ ] Motivation precedes mechanism throughout
- [ ] 2–4 exercises, answerable from material already taught, with self-check descriptions
- [ ] In the correct module folder with `sidebar_position` set
- [ ] Cross-links used instead of re-explanation; no forward references
- [ ] Site builds cleanly: `npm run build` in `book/`

Report which gates passed, and say plainly if any example was not executed and why. An unrun
example is a defect to report, not a detail to omit.
