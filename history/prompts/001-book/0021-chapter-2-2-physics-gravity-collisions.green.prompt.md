---
id: 0021
title: Chapter 2.2 physics gravity and collisions
stage: green
date: 2026-08-15
surface: agent
model: claude-opus-5[1m]
feature: 001-book
branch: main
user: shahzaibkhan2625-tech
command: (direct prompt — Phase 4, task T015)
labels: ["book", "module-2", "chapter-2.2", "T015", "per-module-review", "physics", "inertia", "gazebo-harmonic", "draft-only", "no-reviewers", "pending-env", "session-limit-recovery", "word-budget-breach"]
links:
  spec: specs/001-book/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - book/docs/digital-twin/physics-gravity-collisions.mdx
  - specs/001-book/verification-log.md
tests:
  - npm run build (book/) — passed, run by the orchestrator against the final file; no warnings, no broken links
  - scale_inertia.py EXECUTED on Windows Python, 2 independent runs (chapter-writer, then orchestrator against the shipped .mdx); exit 0; stdout matches the printed transcript line-for-line on all six inertia values
  - fall_probe.py — py_compile clean (rc 0), re-checked by the orchestrator from the shipped .mdx; NOT executed (needs Ubuntu 24.04 + Gazebo Harmonic + display)
  - physics_lab.sdf — xml.etree parse clean, root sdf, world physics_lab, physics name=lab type=dart, max_step_size 0.001; NOT launched
  - Gazebo runs (gz sim, ros_gz_sim create, parameter_bridge, the wrong-tensor comparison) — pending-env, not executed
  - Link allowlist enforced against onBrokenLinks:'throw' — only 3 internal targets used, all existing; no links to 2.3+
  - code-verifier / consistency-checker — DELIBERATELY NOT RUN; they run once per module at T017a
  - Prose ~4,400 words against the NFR-001 band of 1,200–2,500 — BREACH, unresolved, escalated to T017a
---

## Prompt

Module 2, Chapter 2.2 — DRAFT ONLY. Do NOT run code-verifier or
consistency-checker; they run once at the Module 2 review after 2.4.
Follow specs/001-book/tasks.md.

## Chapter 2.2
Use the chapter-writer subagent to write Chapter 2.2
"Physics, Gravity & Collisions" at book/docs/digital-twin/ (per spec's
Chapter Catalog entry for 2.2), applying the chapter-authoring skill.

Key requirements:
- Teach: how a physics engine simulates gravity, mass, inertia, collisions;
  why the inertia tensors from Chapter 1.4's URDF matter here (a wrong tensor
  makes the humanoid behave absurdly); contact/friction; stepping the sim.
- Connect directly to the Chapter 1.4 humanoid and Chapter 2.1 Gazebo setup —
  cross-link, don't rebuild.
- Gazebo needs Linux+GPU → code/commands are pending-env; describe accurately
  (verified at module review).
- Environment: Gazebo Harmonic, ROS 2 Jazzy, Ubuntu 24.04.

## Constraints
- Draft + self-check against the skill only. NO reviewer agents now.
- All 4 parts: objectives, theory, code/commands, exercises.
- onBrokenLinks: 'throw' — only link to existing pages (intro, Module 1
  chapters, Module 2 landing, Chapter 2.1). No links to 2.3+ yet.
- Folder is book/docs/digital-twin/.
- Run npm run build — must stay green.
- Do NOT write 2.3. Stop after 2.2.

## Summary at end
- Files created/changed + what each contains
- Chapter structure briefly
- Build result
- Confirm stopped before 2.3, and confirm you did NOT run reviewers

---

(Follow-up, after the first `chapter-writer` died on a session limit mid-research:)

Check Chapter 2.2 before continuing. Is it drafted (complete or truncated) in
book/docs/digital-twin/? Report what's on disk. Do NOT rewrite.

---

(Follow-up, relaunching after the tree was confirmed clean:)

Chapter 2.2 was never drafted (last agent died during research). Tree is clean.
Draft it now — DRAFT ONLY, do NOT run reviewers (they run at Module 2 review).

## Chapter 2.2
Use the chapter-writer subagent to write Chapter 2.2
"Physics, Gravity & Collisions" at
book/docs/digital-twin/physics-gravity-collisions.mdx (per spec's Chapter
Catalog entry for 2.2), applying the chapter-authoring skill.

Key requirements:
- Teach: physics engine simulating gravity, mass, inertia, collisions; why
  Chapter 1.4's URDF inertia tensors matter here (wrong tensor = absurd
  behaviour); contact/friction; stepping the sim.
- Cross-link to Chapter 1.4 (humanoid/inertia) and Chapter 2.1 (Gazebo) — don't
  rebuild.
- Gazebo needs Linux+GPU → pending-env; describe accurately.
- Environment: Gazebo Harmonic, ROS 2 Jazzy, Ubuntu 24.04.

## Constraints
- Draft + self-check against skill only. NO reviewer agents.
- All 4 parts: objectives, theory, code/commands, exercises.
- onBrokenLinks: 'throw' — only link to existing pages (intro, Module 1,
  Module 2 landing, Chapter 2.1). No links to 2.3+.
- Folder: book/docs/digital-twin/. Filename: physics-gravity-collisions.mdx.
- Run npm run build — must stay green.
- Do NOT write 2.3. Stop after 2.2.

## To save tokens: keep research minimal — you already have Gazebo Harmonic
context from Chapter 2.1. Don't re-verify what 2.1 already established.

## Summary at end
- Files created + what each contains
- Chapter structure briefly
- Build result
- Confirm stopped before 2.3, did NOT run reviewers

---

(Follow-up, closing out the task:)

Chapter 2.2 is already drafted at
book/docs/digital-twin/physics-gravity-collisions.mdx. Do NOT rewrite it and
do NOT run reviewers. Just finish:

1. Run npm run build in book/ — confirm green.
2. Update verification-log.md with 2.2's code/commands as pending-env.
3. Write the PHR. Stop before 2.3.

Summary: build result, verification-log update, confirm stopped before 2.3.

---

(Follow-up, after the connection dropped before the PHR was written:)

The Chapter 2.2 work is done (draft + build + verification-log update) but the
PHR was never written — the connection dropped before it. Write the missing PHR
for Chapter 2.2 now (physics-gravity-collisions). Do NOT change the chapter or
anything else — just create the PHR file. Then confirm which file you created.

## Response snapshot

**Two attempts.** The first `chapter-writer` burned its whole session on doc verification and
died at the session limit having written **nothing** — its last recorded step was "Now let me
verify the Gazebo Harmonic and SDFormat specifics against official sources." Disk check confirmed
the damage was zero: no `*physics*` file anywhere outside `node_modules`, `git status` clean, all
three existing Module 2 files still on their original timestamps. Nothing to salvage, nothing to
clean up.

**The relaunch changed one thing: a research budget.** The second brief stated that Chapter 2.1
had already settled the environment (Harmonic/Jazzy/Noble, `ros-jazzy-ros-gz`, `ros_gz_sim create`,
`/world/empty/pose/info`, z = 0.9, the no-joint-states limit) and that all of it was to be **reused
as given, not re-verified**; capped web lookups at 2–3; told the agent to flag what it could not
cheaply confirm rather than spend a lookup on it; and told it to **write early and refine**, since
a complete draft is the deliverable and a perfectly researched unwritten one is a failure. It
worked — 739 lines drafted, 3 lookups, everything unconfirmed escalated instead of chased.

**The chapter's spine is a two-failure split**, which is what answers the spec's acceptance
scenario ("explains *why* a simulated biped falls, not only which parameters to change").
*Failure one is postural*: `effort="100.0"` on `l_knee_joint` is a **limit, not a motor**, and with
no `<gazebo>` tags nothing drives any joint, so twelve frictionless hinges simply collapse.
*Failure two is balance*: it would tip even if welded rigid. Balance is then named as the open
problem and explicitly left unsolved, per the catalog's out-of-scope list.

**Numbers computed from Chapter 1.4's actual model, not recalled** — the writer extracted the URDF
from the 1.4 MDX and derived: 34.7 kg total (matching 1.4), CoM 0.857 m above the soles, support
polygon x ∈ [−0.070, +0.150] / y ∈ [−0.140, +0.140], tipping margins 4.8° back / 9.8° forward /
9.3° sideways, τ = √(L/g) = 0.30 s, 0.67 s from a 1° lean to the tipping limit. That process caught
a real error mid-draft: the knee's effort had been written as `120.0`, which is the **hip's** value.

**Independent verification by the orchestrator**, not taken on the subagent's word — every artifact
re-extracted from the *shipped* `.mdx` and re-run: `scale_inertia.py` against 1.4's real URDF exits
0 with stdout matching the printed transcript line-for-line on all six inertia values
(`ixx = 254800`, `iyy = 208800`, `izz = 110800`, off-diagonals 0); `fall_probe.py` `py_compile`
clean; `physics_lab.sdf` parses, world `physics_lab`, `<physics name="lab" type="dart">` with
`max_step_size` 0.001. The one "executed" claim holds.

**Log** — five new rows: one `executed` (`scale_inertia.py`), four `pending-env`. Log now 16
examples, 4 `executed`, 12 `pending-env`.

**An unrelated gap surfaced while writing those rows: Chapter 2.1 is not in the log at all.** It
was drafted and committed at `02c2e9b` without rows, so the table jumped 1.4 → 2.2. Rather than
backfill 2.1 from inference — which would mean inventing verification detail nobody performed — a
blockquote was added to the summary recording the gap, naming 2.1's three unlogged examples, and
routing the backfill to T017a before that review reports on the module.

**Build** — green, no warnings, no broken links. Three internal links only, all to existing pages.

**No reviewer agent was run at any point.** Stopped before 2.3.

## Outcome

- ✅ Impact: Chapter 2.2 is `drafted` — 2 of Module 2's 4 chapters now exist. It converts Chapter 1.4's `<inertia>` XML from a formality into a mechanism with consequences, and it satisfies the spec's acceptance scenario for 2.2 by construction: the two-failure split explains *why* the biped falls before it names any parameter. T016 (2.3) and T017 (2.4) are unblocked.
- 🧪 Tests: 1 clean build; 1 of 5 logged examples executed (2 independent runs), 4 pending-env; 3 artifacts independently re-verified by the orchestrator from the shipped file; 0 reviewer passes — by design, deferred to T017a.
- 📁 Files: 1 created (`book/docs/digital-twin/physics-gravity-collisions.mdx`, 739 lines), 1 modified (`specs/001-book/verification-log.md` — 5 rows, summary counts, 2.1-gap note, 2.2 status paragraph).
- 🔁 Next prompts: T016 (Chapter 2.3, simulating sensors — sensor fusion belongs to Module 3), then T017 (2.4 Unity), then T017a runs both reviewers across all four chapters at once. Three items must be resolved **at** T017a and not before: the word-budget breach, the 2.1 log backfill, and the five unverified Harmonic specifics.
- 🧠 Reflection: The failed first attempt and the successful second differed in brief, not in model or task. Unbounded "verify everything against official sources" spent a full session and produced zero lines; the same task with a research cap, an explicit reuse-2.1's-findings clause, and permission to *flag* uncertainty instead of resolving it produced a complete chapter with better-documented gaps. Permission to leave something unverified — provided it is written down — is what made the verification honest rather than absent.
- 🚧 Open decision: **The chapter is ~4,400 prose words against NFR-001's 1,200–2,500 band** — ~50% over the heaviest sibling (2.1 is 2,999) even after a trimming pass that removed ~550 words. The writer's account is that the catalog assigns 2.2 seven distinct topics and that further compression started costing the "explain why" quality the acceptance scenario depends on. This was **not** resolved: the two candidate remedies are accepting the drift or splitting the chapter, and splitting is a spec change (FR-004 requires updating the spec before adding a chapter) that no agent should make unilaterally. Escalated to T017a.

## Evaluation notes (flywheel)

- Failure modes observed: (1) **A research-first agent starving itself of writing budget** — the first attempt died mid-verification with nothing on disk, the most expensive possible failure since the whole session was unrecoverable. (2) **A silent bookkeeping gap in an already-committed chapter** — 2.1 shipped without verification-log rows and nothing caught it for a full chapter; it surfaced only because writing 2.2's rows required looking at where they would go. (3) **A word-budget breach detected but not fixable within the task's authority**, because the only real remedy is a spec change. (4) A wrong figure pulled from an adjacent row of the source model (knee effort `120.0`, actually the hip's) — caught only because the writer recomputed from the extracted URDF instead of quoting from memory.
- Graders run and results (PASS/FAIL): 4-part chapter shape — PASS. Objectives vs catalog "reader can afterwards" — PASS, one-for-one. Environment and versions stated — PASS. Jazzy rclpy idiom — PASS. Motivation before mechanism — PASS. No forward links under `onBrokenLinks:'throw'` — PASS, verified by enumerating every internal link. `sidebar_position: 3` in the right folder — PASS. Build green — PASS. Constitution "every code example executed" — **FAIL**, 1 of 5, recorded per-row. NFR-001 prose band — **FAIL** at ~4,400 vs 2,500, unresolved and escalated.
- Prompt variant (if applicable): the relaunch brief added a **BUDGET section as its first heading**, naming the prior failure explicitly ("a previous attempt died mid-research without writing a single line — do not repeat that"), enumerating exactly which facts were pre-settled by 2.1, capping lookups at 2–3, and granting permission to flag-instead-of-verify. It also inverted the ordering instruction to "write the file early, then refine." Outcome: complete draft, 3 lookups, 5 explicitly flagged unknowns. This variant is worth reusing verbatim for T016 and T017.
- Next experiment (smallest change to try): give the *drafting* brief an explicit prose-word ceiling with the counting method named, as 0018's fix brief did — 0018 proved a costed budget holds when stated up front, and 2.2 breached precisely because the budget was never quantified in the brief. Second, cheaper: add "check that the previous chapter has verification-log rows" to the per-chapter closeout, which would have caught the 2.1 gap one chapter earlier.
