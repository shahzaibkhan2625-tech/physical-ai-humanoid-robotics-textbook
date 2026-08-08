---
id: 0003
title: Phase 0 Repo Walkthrough
stage: general
date: 2026-08-08
surface: agent
model: claude-opus-5[1m]
feature: none
branch: main
user: unknown
command: (conversational request — no slash command)
labels: ["phase-0", "explainer", "onboarding", "docusaurus", "uv", "spec-kit-plus", "read-only"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - none (read-only walkthrough — nothing modified)
tests:
  - none
---

## Prompt

Before we move to Phase 1, walk me through what Phase 0 actually produced.
I am a learner — explain, don't just list.

For each of these, tell me: what the file/folder is, what is inside it, what
job it does in this project, and when I will touch it again:

1. .specify/ — every subfolder, and what constitution.md is for
2. .claude/ — what is in it right now, and how slash commands work
3. book/docusaurus.config.ts — walk me through the settings you set and why
4. book/sidebars.ts — how it controls navigation
5. book/docs/intro.mdx — what the slug: / does
6. book/src/ and book/static/ — what belongs in each
7. backend/pyproject.toml — read it out and explain each field
8. backend/uv.lock vs pyproject.toml — the difference
9. backend/main.py — line by line
10. .gitignore — why each entry is there
11. .env.example — how it relates to .env

Then answer:
- Which of these files will I edit by hand, and which are generated?
- Which files matter for the hackathon score, and why?
- If I deleted any one of these, what would break?

Keep each explanation short — a few lines. Use plain language.
Do not modify anything. This is a read-and-explain task only.

## Response snapshot

Read all 11 targets plus `package.json`, `custom.css` and `README.md`, then
delivered a learner-oriented walkthrough covering each item's purpose, contents,
job in the project, and when it will next be edited — followed by three summary
sections: hand-edited vs generated vs vendored files, which files carry hackathon
score weight, and a per-file "what breaks if deleted" table. Nothing was modified.

Two findings surfaced during the read:

1. `.specify/memory/constitution.md` is still the unfilled template
   (`[PRINCIPLE_1_NAME]`, `[SECTION_2_CONTENT]`, …) — flagged as the largest gap
   in the repo and the recommended first action of Phase 1.
2. `CLAUDE.md` references `.specify/scripts/bash/create-phr.sh`, which does not
   exist on this machine — only the PowerShell scripts were installed.

The PHR for this exchange was deliberately **not** written at the time, because
the user's instruction "Do not modify anything" took precedence over the standing
`CLAUDE.md` rule; this was stated explicitly in the response and the PHR was
offered. This record is the backfill.

## Outcome

- ✅ Impact: User has a complete mental model of the Phase 0 tree, including which files are safe to edit, which are generated, and which failures are silent (`.nojekyll`, `.gitignore`) versus loud (`docusaurus.config.ts`, `main.py`).
- 🧪 Tests: none — read-only task.
- 📁 Files: none modified.
- 🔁 Next prompts: `/sp.constitution` to fill in the project principles; fix the `create-phr.sh` reference in `CLAUDE.md`.
- 🧠 Reflection: The highest-value part of a repo walkthrough is not "what each file is" but "how each file fails" — the silent failures (`.nojekyll` stripping assets in production only, a deleted `.gitignore` sweeping `.env` into history) are the ones a learner cannot discover by reading the file.

## Evaluation notes (flywheel)

- Failure modes observed: A direct conflict between the standing `CLAUDE.md` rule ("create a PHR after every user message") and an explicit per-message user instruction ("do not modify anything"). Resolved in favour of the user instruction, with the conflict surfaced rather than silently resolved — but it left a gap in the record until this backfill. Also confirmed a stale path in `CLAUDE.md`.
- Graders run and results (PASS/FAIL): none run.
- Prompt variant (if applicable): none.
- Next experiment (smallest change to try): For read-only requests, offer the PHR as a single explicit question at the end rather than deferring it silently, so the record is never more than one turn behind.
