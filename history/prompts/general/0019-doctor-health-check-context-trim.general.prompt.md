---
id: 0019
title: Doctor health check and context trim
stage: general
date: 2026-08-11
surface: agent
model: claude-opus-5[1m]
feature: none
branch: main
user: shahzaibkhan2625-tech
command: /doctor
labels: ["doctor", "context-budget", "claude-md", "skills", "permissions", "auto-mode"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - CLAUDE.md
  - .claude/skills/architecture-planning/SKILL.md
  - .claude/skills/phr-authoring/SKILL.md
  - ~/.claude/settings.json (user scope, outside the repo)
tests:
  - All settings-cascade files parse-checked — clean
  - 3 project agent definitions validated — all have name + description, no collisions
  - Transcript scan: 50 sessions across 3 project dirs, 2026-07-18 → 2026-08-11
  - claude --version 2.1.227 vs npm latest 2.1.227 — up to date
  - CLAUDE.md 10,670 → 5,735 chars, measured before and after
---

## Prompt

/doctor — Health-check my Claude Code setup and fix what's wrong: diagnose installation health,
find extensions that cost context but never get used, deduplicate my LOCAL memory files against
checked-in ones, trim checked-in CLAUDE.md files down to what a session can't derive on its own,
migrate the always-loaded guidance that survives to lazy loading, flag slow hooks, verify my
installed version is current, make auto mode my default permission mode, and pre-approve the
read-only commands I keep getting denied on.

## Response snapshot

Run mid-task, while the Chapter 1.4 fix pass was still executing in the background; none of the
changes touch `book/docs/`, so there was no collision.

**Clean on six checks.** One npm global install matching `installMethod`, no leftovers, no PATH
conflict; every settings file parses; all three project agent definitions valid with no name
collisions; no local memory files to deduplicate; version 2.1.227 = latest; one `Stop` hook at a
512 ms median (and belonging to a different project).

**The one real finding was context cost.** `CLAUDE.md` sat at ~2,667 est. tokens in every session,
roughly half of it either derivable from the repo or needed only while planning.

Applied, after confirmation:
- **Cuts** (~275 est. tokens): generated-file boilerplate; the `Basic Project Structure` directory
  listing, reconstructable with one `ls`; and an ADR section duplicating one 80 lines earlier.
- **Migrations** (~960 est. tokens): the 44-line architect template → `architecture-planning`
  skill; the 76-line PHR mechanics → `phr-authoring` skill.
- **Auto mode** set as the user-scope default permission mode, with a backup written first.

Net: `CLAUDE.md` **10,670 → 5,735 chars**, saving ~1,233 est. tokens per session.

**Deliberately kept resident**: the obligation to write a PHR after every message, the full
routing table, and the "there is no `create-phr` script — ignore `sp.phr.md`'s instruction"
gotcha. A rule that must fire every turn cannot live in a file that loads on demand, so only the
mechanics moved. That is why the saving came in below the ~1,425 projected.

**Declined a recommendation of my own**: nine `sp.*` commands have zero lifetime uses, which
normally earns a removal verdict. They stay — the always-loaded `CLAUDE.md` instructs the agent to
run `/sp.adr` and `/sp.phr`, and T011–T038 remain outstanding on the active feature. Removing a
framework's commands mid-feature to save ~250 tokens would be a bad trade.

**Nothing proposed for permissions beyond auto mode**: only 4 denials in 50 sessions, all
user-declined, none a read-only command worth pre-approving. The existing 187 allow rules are
already absorbing routine traffic.

MCP decluttering (7 servers, zero calls in 50 sessions, all deferred so costing no context) was
offered and **declined by the user**.

## Outcome

- ✅ Impact: every future session in this repo carries ~1,233 fewer est. tokens of always-loaded guidance, with no loss of enforceable rules — the migrated content is now reachable on demand instead of resident.
- 🧪 Tests: settings parse-checks clean; agent definitions valid; before/after character counts measured directly; auto-mode write verified by re-reading the key.
- 📁 Files: 1 modified (`CLAUDE.md`), 2 created (two SKILL.md files), 1 user-scope settings file modified with a backup at `~/.claude/settings.json.doctor-backup`.
- 🔁 Next prompts: resume T011. Re-run `/doctor` after any SpecKit Plus upgrade.
- 🧠 Reflection: The interesting judgment was *not* migrating something. The PHR section was the single largest block and the obvious win, but moving the obligation along with the mechanics would have broken a core guarantee to save tokens. Splitting obligation from procedure kept both.
- 🚧 Open decision: `CLAUDE.md` describes itself as generated during init. If SpecKit Plus regenerates it, these trims are silently overwritten — worth confirming whether the generator can be pointed at the trimmed version.

## Evaluation notes (flywheel)

- Failure modes observed: (1) A framework-generated always-loaded file accumulating derivable content and internal duplication that no one reviews, because it is generated rather than written. (2) Usage counters alone would have recommended deleting nine commands that always-loaded guidance actively instructs the agent to call — counter data without cross-referencing the guidance would have produced a harmful recommendation.
- Graders run and results (PASS/FAIL): install health — PASS. Settings parse — PASS. Agent definitions — PASS. Version currency — PASS. Local memory dedup — PASS (nothing to do). Context budget — was FAIL at ~2,667 resident tokens, now materially improved.
- Prompt variant (if applicable): checks were run entirely read-only first and presented as one report before any edit, with recommendations ordered so the sensible default read as the default.
- Next experiment (smallest change to try): check whether the SpecKit Plus generator has a hook or template that can carry these trims forward, so the saving survives the next `init` rather than needing this run repeated.
