---
id: 0009
title: Confirm Target Versions Jazzy Harmonic
stage: spec
date: 2026-08-09
surface: agent
model: claude-opus-5[1m]
feature: 001-book
branch: main
user: shahzaibkhan2625-tech
command: none (direct request — Phase 3 Step 1, version confirmation)
labels: ["research", "versions", "ros2", "jazzy", "gazebo", "harmonic", "isaac-ros", "rclpy", "verification"]
links:
  spec: specs/001-book/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-book/spec.md
  - history/prompts/001-book/0009-confirm-target-versions-jazzy-harmonic.spec.prompt.md
tests:
  - none (research and spec amendment; verified by cross-checking primary sources)
---

## Prompt

Phase 3, Step 1: confirm the target versions before any chapter is written.
Do not write chapters yet — this step only settles versions and records them.

## Research first
Check the official sources for the CURRENT state (my spec assumed Jazzy +
Gazebo Harmonic + Ubuntu 24.04, but that was an unverified assumption):
- docs.ros.org — what is the current ROS 2 LTS distribution, its support
  status, and its supported Ubuntu version?
- gazebosim.org — which Gazebo release pairs with that ROS 2 LTS?
- Confirm the rclpy API basics haven't changed for that distribution.

State clearly what you found, with the source for each fact.

## Then
- If the versions match my spec's assumption (Jazzy / Harmonic / Ubuntu 24.04),
  confirm it.
- If a newer LTS has superseded it, tell me the difference and recommend which
  to target for the book, with reasoning (stability vs currency).
- Update specs/001-book/spec.md Assumption 2 to record the confirmed target as
  the book-wide version, replacing the "expected/to be verified" wording.

## Constraints
- Facts only, each with a source URL. If a source is unreachable, say so rather
  than guessing.
- Do not change anything else in the spec.
- Do not write chapter content.

## Summary at end
- Confirmed versions (ROS 2, Gazebo, Ubuntu) with sources
- Whether this matches or changes the spec's assumption
- What you updated in the spec

## Response snapshot

**Source availability.** `docs.ros.org` is behind Anubis anti-bot protection and returned Access
Denied to every automated fetch; this is stated rather than worked around. Substituted primary
sources: the `ros2/ros2` GitHub releases page (the actual release artifacts), REP-2000, and
`gazebosim.org`, cross-checked against endoflife.date.

**Findings.**

- A newer LTS exists. **ROS 2 Lyrical Luth** released 2026-05-22, LTS to 2031-05, on Ubuntu 26.04
  (Resolute) — the twelfth ROS 2 release. Confirmed by ros2/ros2 GitHub releases (Lyrical Patch
  Release 2, 2026-08-07) and endoflife.date. The spec's assumption was therefore stale.
- **Jazzy Jalisco** remains an actively supported LTS: released 2024-05-23, EOL 2029-05, Tier 1
  Ubuntu 24.04 (Noble), Patch Release 8 shipped 2026-06-18.
- **Gazebo pairings** (gazebosim.org `ros_installation` table): Jazzy ↔ **Harmonic**,
  Kilted ↔ Ionic, Lyrical ↔ **Jetty**. Harmonic is LTS to 2029-05, aligning exactly with Jazzy.
- **rclpy**: the classic API is unchanged — `Node`, `create_publisher`, `create_subscription`,
  `create_timer`, `spin`, `get_logger` are identical across Jazzy and Lyrical, verified by
  diffing the canonical `ros2/examples` minimal publisher on the `jazzy` and `lyrical` branches.
  What *did* change is the init/shutdown idiom: Jazzy uses
  `rclpy.init()` … `destroy_node()` … `rclpy.shutdown()`; Lyrical's example uses
  `with rclpy.init(args=args):` plus `ExternalShutdownException` handling. Lyrical also adds
  `rclpy.experimental.AsyncNode` (explicitly experimental, additive).

**Decision: stay on Jazzy + Harmonic + Ubuntu 24.04.** Not because the assumption happened to be
right, but because the binding constraint is Module 3, not ROS: NVIDIA Isaac ROS states "All Isaac
ROS packages are designed and tested to be compatible with ROS 2 Jazzy" on Ubuntu 24.04, with no
mention of Lyrical or Ubuntu 26.04; Isaac Sim lists only Humble and Jazzy as officially tested and
recommends Jazzy on 24.04. Targeting Lyrical would make Module 3's examples unverifiable, breaking
Constitution Principle II. Nav2 *does* support Lyrical (new `nav2_ros_common` package), so Nav2 is
not the constraint — Isaac is. The oldest dependency in the stack sets the target, not the newest
release.

**Spec updated.** `specs/001-book/spec.md` Assumption 2 only — confirmed 26 insertions, 4
deletions, nothing else touched (`git diff --stat`). The rewritten assumption records the
confirmed versions with dates and support windows, states explicitly that a newer LTS exists and
why it was rejected, adds the rclpy idiom consequence for chapter authors (Jazzy-era init/shutdown;
no context-manager form, no `AsyncNode`), and sets a re-verification trigger (Isaac ROS publishing
Lyrical support, or Jazzy EOL 2029-05, whichever is first).

No chapter content written.

## Outcome

- ✅ Impact: The book's single most cross-cutting technical decision is now verified rather than
  assumed, with the reasoning recorded. The finding inverted the expected rationale: the right
  target is the older LTS, and the reason is Isaac ROS, not ROS 2 itself.
- 🧪 Tests: None. Verification was cross-source: three independent sources for the Lyrical release
  and Jazzy support window, gazebosim.org for the pairing table, and a branch-to-branch diff of
  the canonical rclpy example for the API check.
- 📁 Files: `specs/001-book/spec.md` (Assumption 2 only), this PHR.
- 🔁 Next prompts: Phase 3 Step 2 — begin chapter writing against the confirmed target, starting
  with Module 1. Consider `/sp.plan` for 001-book first, since the plan is where the per-chapter
  verification workflow belongs.
- 🧠 Reflection: The useful question was not "what is the newest LTS" but "what does the most
  constrained dependency support". Checking Isaac ROS turned a currency-vs-stability judgement
  call into a determined answer — had I only checked docs.ros.org and gazebosim.org as the prompt
  literally asked, the recommendation would plausibly have been Lyrical, and Module 3 would have
  been unwritable.

## Evaluation notes (flywheel)

- Failure modes observed: `docs.ros.org` blocked all automated fetches (Anubis), and two guessed
  raw-GitHub documentation paths 404'd. Recovered by going to the release artifacts and the
  `ros2/examples` source rather than the rendered docs. Lesson: for version facts, release
  artifacts and source branches are both more reachable and more authoritative than doc pages.
- Graders run and results (PASS/FAIL): cross-source agreement PASS (3 sources for the Lyrical
  release, 2 for the Gazebo pairing, direct source diff for rclpy). `git diff --stat` confirms the
  spec edit was confined to Assumption 2 — PASS.
- Prompt variant (if applicable): none.
- Next experiment (smallest change to try): before writing Module 3, pin the exact Isaac ROS
  release (documentation currently shows release-4.5) and its CUDA/driver floor, since those are
  harder constraints on a reader's machine than the ROS distribution is.
