---
id: 0016
title: Chapter 1.2 ROS 2 architecture
stage: green
date: 2026-08-10
surface: agent
model: claude-opus-5[1m]
feature: 001-book
branch: main
user: shahzaibkhan2625-tech
command: (direct prompt — Phase 3, task T008; resumed after a session-limit interruption)
labels: ["book", "module-1", "chapter-1.2", "T008", "per-chapter-loop", "pending-env", "static-verification"]
links:
  spec: specs/001-book/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - book/docs/ros2/ros2-architecture.mdx
  - specs/001-book/verification-log.md
tests:
  - npm run build (book/) — passed after the fix pass, run independently by the orchestrator
  - Static verification only — no ROS 2 on the authoring machine, no example executed
  - 4/4 Python programs pass ast.parse and py_compile; pyflakes reports zero findings
  - Both `ros2 interface show` blocks diffed character-exact against Float64.msg and SetBool.srv on the jazzy branch
---

## Prompt

Phase 3: write Chapter 1.2, following specs/001-book/tasks.md (T008). Do only
this chapter, then stop for my review before 1.3.

## T008 — Chapter 1.2
Use the chapter-writer subagent to write Chapter 1.2
"ROS 2 Architecture: Nodes, Topics, Services" at
book/docs/ros2/ros2-architecture.mdx, applying the chapter-authoring skill and
the spec's Chapter Catalog entry for 1.2.

Key requirements for this chapter:
- It must cross-link back to Chapter 1.1's "a robot is many programs" framing
  rather than re-deriving it (this was flagged as a debt after 1.1).
- Code uses rclpy (ROS 2 Jazzy). Use ONLY the Jazzy idiom
  (rclpy.init()/destroy_node()/rclpy.shutdown()), never the Lyrical
  context-manager form or AsyncNode.
- Every code example states its assumed environment (ROS 2 Jazzy, Ubuntu 24.04).

Then have code-verifier and consistency-checker review it independently in
parallel. Apply blocker/major fixes with chapter-writer.

## Execution note
This chapter's code needs ROS 2, which this machine does not have. So:
- code-verifier does STATIC checks only: Python syntax, real-vs-invented rclpy
  APIs, correct Jazzy idiom, imports present, environment stated. It does NOT
  run the code.
- Record each example in verification-log.md as status: pending-env
  (environment required: ros:jazzy-desktop), not executed.

## Constraints
- Follow the constitution and chapter-authoring skill exactly.
- All 4 parts: objectives, theory, runnable code, exercises.
- Respect onBrokenLinks: 'throw' — only link to pages that already exist
  (intro, Module 1 landing, Chapter 1.1). No links to 1.3+ which don't exist yet.
- Do NOT write Chapter 1.3 or beyond. Stop after 1.2.
- Run npm run build in book/ at the end — must stay green.

## Summary at end
- Which files were created/changed, and what each contains
- Chapter structure briefly
- What each reviewer found + what you fixed
- verification-log update (pending-env entries)
- Build result
- Confirm you stopped before 1.3

---

**Follow-up prompt** (after the drafting agent died mid-task on a session limit):

Resume T008 for Chapter 1.2. The draft is already written at
book/docs/ros2/ros2-architecture.mdx but the writer died before review.
Do NOT rewrite the chapter. Continue from where it stopped:

1. Run code-verifier and consistency-checker on the existing draft, in
   parallel, independently. code-verifier does STATIC checks only (no ROS on
   this machine): Python syntax, real-vs-invented rclpy APIs, correct Jazzy
   idiom (not Lyrical), imports, environment stated.
2. Apply any blocker/major fixes with chapter-writer.
3. Record each code example in verification-log.md as status: pending-env
   (environment required: ros:jazzy-desktop), not executed.
4. Run npm run build in book/ — must stay green.
5. Stop before Chapter 1.3.

Summary: which files changed, what each reviewer found + fixes, verification-log
update, build result, confirm stopped before 1.3.

## Response snapshot

The drafting agent hit the session usage limit and terminated after writing the file
but before verification or build. The draft survived intact on disk (22.5 KB, four parts
complete), so the loop resumed from review rather than restarting — no rewrite.

**Reviews**, run in parallel on the existing draft: **0 blockers, 1 major, 12 minors**
(7 actionable).

`consistency-checker` ruled the T008 cross-link debt **discharged**. Chapter 1.2 opens by
linking 1.1 and explicitly ceding the argument ("That they *must* be separate programs is
settled there"), then asks a new question — what the transport must *provide*. Its four
requirements (addressing without hard-coding, non-blocking producers, one-to-many fan-out,
independent lifetimes) are material 1.1 never covers, and the one bullet that touches 1.1
cites it in the same sentence. The count of tellings of "a robot is many programs" stays at
three. Objectives matched the catalog three-for-three, so the extra-objective dispute from
1.1 did not recur. Both borderline scope calls — actions and QoS — came back within
"name it, do not teach it".

`code-verifier` confirmed the code itself sound: 4/4 clean parse, zero pyflakes findings,
correct Jazzy init/shutdown idiom in all four programs, no Lyrical-era forms, and the
`rclpy.create_node` client pattern matching `ros2/examples@jazzy` `minimal_client`
line-for-line in structure. Both `ros2 interface show` blocks are character-exact
reproductions of the real `Float64.msg` and `SetBool.srv`, comments and internal spacing
included. The rcutils default log format and its timestamp shape were confirmed from
`logging.c` and `time.c`.

The major was in claimed output, not code: on Jazzy an `rclpy` node starts a **seventh**
built-in service, `~/get_type_description` (REP 2016, parameter defaults to `True`, service
instantiated unconditionally in `node.py`), so the printed `ros2 service list` was one line
short and "six inherited" was wrong. The official turtlesim tutorial shows six because
turtlesim is `rclcpp` — a distinction the verifier surfaced and correctly declined to
over-claim, since it could not confirm rclcpp's default.

**Fixes** — all 8 applied by `chapter-writer`, no code changed (four programs byte-identical
after the pass). Beyond the major: the pilot's printed values contradicted the sensor's own
timeline by 0.12 m (14 ticks at 0.02 m from 1.00 m is 0.72, not 0.84 — corrected to
0.72/0.70/0.68); `ros2 topic pub` repeats at 1 Hz so Exercise 3 needed `--once` named;
"actions" was disambiguated on first use because 1.1 fixed it as the everyday word for
irreversible acts and 1.2 rebinds it to the ROS 2 primitive; the reused 1.1 example promised
three nodes and delivers two, now owned in one sentence that also acknowledges the dropped
sensor noise and open loop; "compliant mode" replaced as unglossed control-theory vocabulary;
two appeals to official documentation got real links, derived from `ros2_documentation` source
paths and status-checked 200; and Exercise 4(e) was substituted because the body answered it
verbatim.

Prose came in at **2,450 words**, down from 2,514 — the additions cost ~+80 and were paid for
with structural cuts to restated material, not by dropping motivation.

**Log** — three `pending-env` rows against `ros:jazzy-desktop`, each separating what static
verification established from what only execution can settle, plus three items flagged for
re-check at T037: whether `get_type_description` really appears (inferred from source, not
observed), the float rendering of `ros2 topic echo` YAML, and CLI list ordering (which the
tool does not sort).

**Build** — `npm run build` green, verified independently by the orchestrator after the fix pass.

Stopped before Chapter 1.3.

## Outcome

- ✅ Impact: Chapter 1.2 is `drafted` — reviewed by both agents, all blocker/major findings fixed, build green — but **not `verified`**, because none of its four programs or nine CLI invocations has been executed. This is the first chapter to exercise the `pending-env` path, and it establishes the pattern for the remaining eleven ROS-dependent chapters.
- 🧪 Tests: 1 clean build; static verification only — 4/4 parse and pyflakes clean, 27 APIs and output shapes confirmed against primary sources on the `jazzy` branch, 2 items explicitly recorded as unconfirmable without a running system.
- 📁 Files: 1 created (`book/docs/ros2/ros2-architecture.mdx`), 1 modified (`verification-log.md`: 3 rows plus summary; examples logged 1 → 4, `pending-env` 0 → 3).
- 🔁 Next prompts: T009 (Chapter 1.3, `rclpy` agent node) after user review. Chapter 1.3 is where the agent-node skeleton and the Jazzy idiom propagate book-wide, so its review matters more than most. Two link-backfill sites now exist in 1.2 (the closing teaser at "That is next", and the parameter-services mention) that should point at 1.3 once it lands.
- 🧠 Reflection: A drafting agent dying mid-task turned out to be cheap because the artifact is a file, not a conversation — the draft was reviewable exactly as found, and resuming cost one review cycle instead of a rewrite. Worth remembering: the per-chapter loop is restartable at any step boundary.
- 🚧 Open: `rclcpp`'s `get_type_description` default is unverified. It does not affect this chapter (all four programs are `rclpy`) but it will matter if a later chapter prints a service listing for a C++ node.

## Evaluation notes (flywheel)

- Failure modes observed: (1) **fabricated-transcript drift** — with no ability to run the code, the writer produced two console blocks that were each individually plausible but mutually inconsistent by arithmetic a reader can redo in their head. This is the characteristic `pending-env` failure and will recur in every unexecutable chapter. (2) A real behavioural change in the target distribution (`get_type_description`, new in Jazzy) that model memory and the official tutorial both get wrong, catchable only by reading the distribution's own source. (3) Terminology collision created one chapter after the term was fixed — invisible chapter-locally.
- Graders run and results (PASS/FAIL): chapter-file contract §7 items 1–10 — PASS. Constitution chapter quality gates — PASS except "every example executed", which FAILS by environment and is recorded, not hidden. Prose 2,450 of a 2,500 ceiling — PASS. Objectives vs catalog — PASS 3/3.
- Prompt variant (if applicable): the verifier was told to diff the two `ros2 interface show` blocks character-by-character against the real `.msg`/`.srv` files, and to treat "could not confirm" as a reportable category distinct from "confirmed wrong". Both paid off — the interface blocks came back exact, and the two genuinely unconfirmable items were surfaced instead of being silently blessed.
- Next experiment (smallest change to try): for `pending-env` chapters, have the writer state the arithmetic invariant behind any multi-block transcript (here: "gap = 1.00 − 0.02 × tick, tick = (t − t₀)/0.5") in its report, so cross-block consistency is checkable without a running system. That single discipline would have caught the pilot-value defect at draft time rather than at review.
