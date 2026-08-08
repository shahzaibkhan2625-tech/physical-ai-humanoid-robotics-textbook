---
id: 0004
title: Backfill PHRs And Fix Script Path
stage: general
date: 2026-08-08
surface: agent
model: claude-opus-5[1m]
feature: none
branch: main
user: unknown
command: (conversational request — no slash command)
labels: ["phr", "backfill", "documentation", "claude-md", "process", "correction"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - history/prompts/general/0001-phase-0-repo-scaffold.general.prompt.md
  - history/prompts/general/0002-commit-phase-0-scaffold.general.prompt.md
  - history/prompts/general/0003-phase-0-repo-walkthrough.general.prompt.md
  - history/prompts/general/0004-backfill-phrs-fix-script-path.general.prompt.md
  - CLAUDE.md
tests:
  - none
---

## Prompt

Resume writing Prompt History Records as CLAUDE.md instructs — starting now,
and for the rest of this project.

First, catch up on what has already happened:
1. Write PHRs retroactively for the Phase 0 work (scaffold, commit, and the
   explain-the-repo walkthrough).
2. Then confirm where PHRs are stored and what each one contains.

One correction while you're at it: CLAUDE.md references
.specify/scripts/bash/create-phr.sh, which does not exist — only the
PowerShell scripts were installed. Fix that reference so the path is correct
on this machine.

Then summarize: PHR file location, what a PHR records, and what I need to do
(if anything) to keep them accurate.

## Response snapshot

Created `history/prompts/general/` (the tree did not exist) and backfilled
PHR-0001 through PHR-0003 for the Phase 0 scaffold, the initial commit, and the
read-only repo walkthrough. PHR-0001 and PHR-0002 are explicitly labelled as
reconstructions — the original prompts predate PHR discipline and were not
captured verbatim, so their intent is stated as derived from commit `cc16aad`
rather than presented as the user's words. PHR-0003 carries its prompt verbatim.

On the requested correction: the premise was right but the fix could not be what
was assumed. There is no `create-phr` script anywhere in the repo — not
`.specify/scripts/bash/create-phr.sh` and not a PowerShell equivalent. Repointing
the path would have swapped one dead reference for another, so `CLAUDE.md` step 5
was rewritten to state that no PHR script is installed and that the agent-native
template flow (step 3) is the only supported path. Step 4 was also amended,
because `.claude/commands/sp.phr.md` contains the same dead `create-phr.sh`
invocation and is vendored, so it was left untouched and is now explicitly
overridden by `CLAUDE.md`.

## Outcome

- ✅ Impact: PHR trail now starts at Phase 0 with no gaps; `CLAUDE.md` no longer sends the agent at a non-existent script.
- 🧪 Tests: none — documentation and process change only.
- 📁 Files: 4 PHRs created, `CLAUDE.md` edited (steps 4–5 of the PHR section).
- 🔁 Next prompts: `/sp.constitution` to fill in `.specify/memory/constitution.md`; `git config user.name` so PHRs and commits stop recording `unknown`.
- 🧠 Reflection: A stale reference is worth verifying before "fixing" it — the assumed correction (bash → PowerShell) would have been wrong, because the real state was that neither file exists. The vendored `sp.phr.md` carries the same defect and cannot be fixed in place, so the override belongs in `CLAUDE.md`.

## Evaluation notes (flywheel)

- Failure modes observed: `CLAUDE.md` and the vendored `.claude/commands/sp.phr.md` disagree with the installed scripts — both reference a bash script the `specifyplus` Windows install never shipped. `git config user.name` remains unset, so every PHR and commit records `unknown`. The two retroactive PHRs cannot satisfy the "PROMPT_TEXT verbatim" guarantee and are marked as reconstructions rather than silently fabricated.
- Graders run and results (PASS/FAIL): manual check — PASS. All four files contain no unresolved template tokens; stage `general` matches route `history/prompts/general/`; IDs 0001–0004 are unique and sequential.
- Prompt variant (if applicable): none.
- Next experiment (smallest change to try): Write each PHR in the same turn as the work it records, so no future backfill has to reconstruct a prompt.
