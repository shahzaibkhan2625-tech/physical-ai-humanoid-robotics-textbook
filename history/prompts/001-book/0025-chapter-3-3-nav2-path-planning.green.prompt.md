---
id: 0025
title: Chapter 3.3 Nav2 Path Planning for Bipeds
stage: green
date: 2026-08-20
surface: agent
model: claude-opus-5
feature: 001-book
branch: main
user: shahzaibkhan2625-tech
command: chapter-writer subagent (draft-only, no reviewers)
labels: ["module-3", "nav2", "ros2-actions", "bipedal-navigation", "draft-only"]
links:
  spec: specs/001-book/spec.md#33-nav2-path-planning-for-bipeds
  ticket: specs/001-book/tasks.md#T024
  adr: null
  pr: null
files:
  - book/docs/isaac/nav2-path-planning.mdx (created)
  - book/docs/isaac/index.mdx (modified — linked the now-existing Chapter 3.3)
tests:
  - npm run build (book/) — SUCCESS, onBrokenLinks='throw' so all internal links resolved
  - python -m py_compile send_nav_goal.py — passed (syntax only; example marked `blocked`)
  - check_support_polygon.py — executed, output captured verbatim into the chapter
---

## Prompt

Module 3, Chapter 3.3 — DRAFT ONLY. No reviewers. Follow tasks.md.

## Chapter 3.3
Use the chapter-writer subagent to write Chapter 3.3
"Nav2: Path Planning for Bipeds" at book/docs/isaac/nav2-path-planning.mdx,
applying the chapter-authoring skill and the spec's Chapter Catalog entry.

Key requirements:
- Teach: Nav2 (ROS 2 navigation stack), path planning for bipeds, costmaps,
  how the humanoid uses SLAM (3.2) output to navigate.
- Cross-link to 3.1, 3.2, 1.4 (humanoid), 2.3 (sensors). Don't rebuild.
- GPU/ROS needed → code "blocked". Theory must stand alone.
- Environment: Nav2, ROS 2 Jazzy, Ubuntu 24.04.
- Keep research minimal. Write early.

## Constraints
- NO reviewer agents. Draft + skill self-check only.
- All 4 parts. onBrokenLinks — only existing pages. Build green.
- Folder: book/docs/isaac/. Stop after 3.3.

## Summary: files created, chapter structure, build result, confirm no reviewers

## Response snapshot

Dispatched a single `chapter-writer` subagent with the spec's Chapter Catalog entry (spec.md §3.3),
tasks.md T024, the allowed-link inventory, and the Jazzy-API accuracy constraint. No `code-verifier`
and no `consistency-checker` were launched, per the draft-only instruction.

Chapter structure (constitution's four parts):

1. **Learning objectives** — five, mapping to the spec's "reader can afterwards" list.
2. **Theory** — the global/local split; costmaps and their static/obstacle/inflation layers;
   what Nav2 needs before planning (map, pose, goal) with the behavior-tree navigator named and
   BT authoring held out of scope; **ROS 2 actions introduced here** as the third primitive, with
   `NavigateToPose`'s goal/feedback/result fields; the `ActionClient` method walkthrough; and
   "What changes for a biped" — moving footprint, discrete footholds, balance constraint, closing
   by naming footstep planning as the explicit gap.
3. **Code examples** — Example 1 `send_nav_goal.py` (`rclpy.action.ActionClient` sending, watching,
   and cancelling a `NavigateToPose` goal) marked **`blocked`**, environment required: a running
   Jazzy + Nav2 stack with a map and localization — explicitly *not* a GPU requirement, since the
   client is plain `rclpy` + `nav2_msgs`. Example 2 `check_support_polygon.py` (stdlib-only COM /
   support-polygon check using Ch 1.4's real foot geometry) **executed**, real output pasted.
4. **Exercises** — four, each with a stated correct-result self-check.

Two defects found and fixed on review of the draft: `python-agents-rclpy.mdx` was cited as
"Chapter 1.4" when the spec numbers it 1.3, and the required cross-link to Chapter 3.1 was absent —
added at the costmap obstacle layer, where learned detections tie back to synthetic training data.
Also linked the chapter from `isaac/index.mdx`, which previewed it in plain text while the page
did not yet exist.

Flagged to the user: tasks.md T024 and plan.md both name the file
`nav2-path-planning-for-bipeds.mdx`, while the prompt specified `nav2-path-planning.mdx`. Went with
the explicit path from the prompt and surfaced the discrepancy for the user to settle.

## Outcome

- ✅ Impact: Chapter 3.3 drafted; Module 3's three chapters are now all drafted, leaving T024a
  (the Module 3 two-reviewer pass) as the next gate.
- 🧪 Tests: `npm run build` green with `onBrokenLinks: 'throw'`; Example 2 executed and passing;
  Example 1 syntax-checked only and recorded as `blocked`.
- 📁 Files: 1 created (`book/docs/isaac/nav2-path-planning.mdx`), 1 modified
  (`book/docs/isaac/index.mdx`).
- 🔁 Next prompts: T024a Module 3 review (`code-verifier` + `consistency-checker` over 3.1–3.3 and
  `index.mdx`); T026 reconcile `verification-log.md`, recording Example 1 as `blocked`; settle the
  filename discrepancy against tasks.md/plan.md.
- 🧠 Reflection: a draft-only pass still needs the dispatcher to verify cross-link *labels*, not
  just link targets — the build catches a broken path but never catches a link pointing at the
  right file under the wrong chapter number.

## Evaluation notes (flywheel)

- Failure modes observed: (1) chapter-number mislabel on a valid link — invisible to the build;
  (2) one required cross-link (3.1) silently dropped despite being listed in the agent's brief.
- Graders run and results (PASS/FAIL): Docusaurus build PASS; four-part chapter shape PASS;
  no-forward-reference check PASS (no Module 4 references); required-cross-link check FAIL on first
  draft, PASS after fix.
- Prompt variant (if applicable): chapter-writer brief carried an explicit allowed-link inventory
  and an explicit "verify each target exists" instruction — target verification held, label and
  completeness verification did not.
- Next experiment (smallest change to try): have the chapter-writer brief require a closing
  cross-link checklist in its report — each required link echoed back with the chapter number it
  was labelled as — so completeness and labelling are self-reported rather than caught downstream.
