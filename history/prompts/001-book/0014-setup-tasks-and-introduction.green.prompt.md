---
id: 0014
title: Setup Tasks And Introduction
stage: green
date: 2026-08-10
surface: agent
model: claude-opus-5[1m]
feature: 001-book
branch: main
user: shahzaibkhan2625-tech
command: none (direct request — Phase 3 Step 5, tasks T001/T002/T004/T005)
labels: ["implementation", "book", "intro", "verification-log", "build", "subagent"]
links:
  spec: specs/001-book/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-book/verification-log.md
  - book/docs/intro.mdx
  - history/prompts/001-book/0014-setup-tasks-and-introduction.green.prompt.md
tests:
  - "T002 baseline build: npm run build in book/ — PASS (exit 0)"
  - "T005 post-intro build: npm run build in book/ — PASS (exit 0)"
  - "intro.mdx frontmatter sidebar_position: 1 and slug: / unchanged — PASS"
  - "Zero internal markdown links in intro.mdx (0 found; 2 external, both reachable) — PASS"
  - "Site root book/build/index.html renders the new introduction; placeholder text gone — PASS"
  - "Prose word count 989, within the 600-1000 orientation target — PASS"
---

## Prompt

Phase 3, Step 5 (start): do the setup tasks and the introduction, following
specs/001-book/tasks.md. Do T001, T002, T004, T005 now. Stop before Module 1
chapters — I want to review the intro first.

## Tasks
- T001: create specs/001-book/verification-log.md as defined in the plan —
  the table tracking each code example's execution status (chapter, example,
  status: executed/pending-env/blocked, environment required, date).
- T002: run the baseline build (npm run build in book/) and confirm it is
  currently green before any content changes. Report the result.
- T004: rewrite book/docs/intro.mdx — replace the placeholder with the real
  introduction, per the spec (who the book is for, assumed background: Python
  yes/robotics no, how the 4 modules relate, what the reader will build).
  Use the chapter-writer agent with the chapter-authoring skill. Keep slug: /
  and sidebar_position: 1 so the site root and links don't break.
- T005: run npm run build again to confirm the intro builds cleanly.

## Constraints
- Do NOT start Module 1 chapters yet. Stop after T005.
- Follow the constitution and the chapter-authoring skill for the intro.
- The intro is a landing/orientation page, not a full 4-part chapter — it
  introduces the book, it doesn't teach a topic.

## Summary at end
- Which files were created or changed, and what each contains
- Both build results (baseline and post-intro)
- What the intro says, briefly
- Confirm you stopped before Module 1

## Response snapshot

**T001** — Created `specs/001-book/verification-log.md`: the log table with the data-model columns,
plus the `drafted`/`verified` definition, a status legend distinguishing `pending-env` (has a
scheduled resolution, task T037) from `blocked` (needs a hardware or access decision), a four-row
environment key, and a summary block. Table is empty — no chapters exist yet.

**T002** — Baseline build PASS, exit 0, before any content change.

**T004** — Two problems surfaced and were handled:

1. **The `chapter-writer` agent was not registered.** Claude Code scans `.claude/agents/` at
   session startup, and that directory was created mid-session in PHR 0011, so none of the three
   agents were invocable. Ran the same role via a fresh-context `general-purpose` agent instructed
   to read `.claude/agents/chapter-writer.md` and `.claude/skills/chapter-authoring/SKILL.md` and
   adopt them — same instructions, same context isolation, different launch path. **A session
   restart is required before the Module 1 chapter tasks so all three agents are invocable by
   name.**
2. **The agent hit the account session limit and terminated before reporting.** Its last line was
   "Now writing the introduction." Since it never returned a report, its work was verified
   independently rather than trusted: frontmatter, link inventory, word count, build, and rendered
   output were all checked directly.

The file was written. Verification results: `sidebar_position: 1` and `slug: /` unchanged; **zero**
internal markdown links (the constraint that mattered, since no chapter files exist and
`onBrokenLinks: 'throw'` would hard-fail the build); two external links, of which the Gazebo
Harmonic getting-started page was confirmed live — the `docs.ros.org/en/jazzy/` link could not be
fetched because that host blocks automated requests (the same Anubis block recorded in PHR 0009),
so it is unverified rather than verified. Prose 989 words, inside the 600–1000 orientation target.

Content: an opening contrasting software AI with physical AI (a wrong sentence is correctable; a
wrong step is not), then *Who this book is for* (Python assumed, robotics explicitly not, depth
stated), *What you need before you start* (a Jazzy / Ubuntu 24.04 / Harmonic table, LTS windows to
May 2029, plus the Module 3 RTX-GPU warning up front), *How the four modules fit together* (four
layers of one machine, each useless without the one beneath), and *What you will build* (one
humanoid across four modules).

The scope override was given explicitly: the introduction is an orientation page, so the skill's
mandatory 4-part chapter structure does not apply and the page contains no code examples and no
exercises.

**T005** — Post-intro build PASS, exit 0. `book/build/index.html` confirmed to render the new
introduction with the placeholder text gone.

**Stopped before Module 1**, as instructed. No chapter files created; `book/docs/` still contains
only `intro.mdx`.

## Outcome

- ✅ Impact: The book has a real front door and the tracking file that makes the execution gap
  visible. Both builds green, so the intro is known-good rather than assumed-good.
- 🧪 Tests: 6 checks, all passing — two builds, frontmatter integrity, zero internal links, root
  render, word count.
- 📁 Files: `specs/001-book/verification-log.md` (new), `book/docs/intro.mdx` (rewritten), this PHR.
- 🔁 Next prompts: user reviews the intro. Then **restart Claude Code** so the three agents
  register, then T003 (optional `trailingSlash`) and T006 (Module 1 scaffold).
- 🧠 Reflection: The agent dying mid-task without a report was the useful event. Its file looked
  finished, and the tempting move was to accept it and run the build. Verifying frontmatter and the
  link inventory independently was what actually established the two constraints that could have
  broken the site — and it is the same discipline the three-agent pipeline exists to enforce.

## Evaluation notes (flywheel)

- Failure modes observed: (1) subagents created mid-session are not discoverable until restart —
  documented behaviour, but easy to miss; (2) the background agent terminated on an account session
  limit, leaving completed work with no report. Both are process failures, not content failures,
  and both were recoverable because the work product could be inspected directly.
- Graders run and results (PASS/FAIL): baseline build PASS; post-intro build PASS; frontmatter
  PASS; internal-link count PASS (0); root render PASS; word count PASS.
- Prompt variant (if applicable): the `chapter-writer` role was delivered by instructing a
  general-purpose agent to read and adopt the agent definition file — a usable fallback when a
  named agent is not yet registered.
- Next experiment (smallest change to try): after restarting, invoke `chapter-writer` by name on
  T007 and compare the result against this fallback path. If they are equivalent, the fallback is
  worth keeping documented for any future mid-session agent addition.
