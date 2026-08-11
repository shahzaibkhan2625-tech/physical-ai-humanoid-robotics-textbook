---
name: phr-authoring
description: Step-by-step mechanics for writing a Prompt History Record (PHR) file — stage detection, title and slug, ID allocation, output path, filling every template placeholder, and post-creation validation. Use when creating a PHR, which CLAUDE.md requires after every user message.
---

# PHR Creation Process

`CLAUDE.md` carries the obligation (write a PHR after every user message) and the routing table.
This skill carries the mechanics.

**Critical constraint:** there is no PHR creation script in this repo, in any form — neither
`.specify/scripts/bash/create-phr.sh` nor a `.ps1` equivalent. The project ships only
`.specify/scripts/powershell/` (`check-prerequisites.ps1`, `common.ps1`, `create-new-feature.ps1`,
`setup-plan.ps1`, `update-agent-context.ps1`). `.claude/commands/sp.phr.md` instructs the agent to
run `create-phr.sh` — **ignore that instruction.** The agent-native flow in step 3 is the ONLY
supported way to create a PHR. Do not attempt to invoke a PHR script.

## 1) Detect stage

One of: `constitution` | `spec` | `plan` | `tasks` | `red` | `green` | `refactor` | `explainer` |
`misc` | `general`

## 2) Generate title

3–7 words; create a slug for the filename.

## 2a) Resolve route (all under `history/prompts/`)

- `constitution` → `history/prompts/constitution/`
- Feature stages (spec, plan, tasks, red, green, refactor, explainer, misc) →
  `history/prompts/<feature-name>/` (requires feature context)
- `general` → `history/prompts/general/`

## 3) Agent-native flow (no shell)

- Read the PHR template from one of:
  - `.specify/templates/phr-template.prompt.md`
  - `templates/phr-template.prompt.md`
- Allocate an ID (increment; on collision, increment again).
- Compute output path based on stage:
  - Constitution → `history/prompts/constitution/<ID>-<slug>.constitution.prompt.md`
  - Feature → `history/prompts/<feature-name>/<ID>-<slug>.<stage>.prompt.md`
  - General → `history/prompts/general/<ID>-<slug>.general.prompt.md`
- Fill ALL placeholders in YAML and body:
  - ID, TITLE, STAGE, DATE_ISO (YYYY-MM-DD), SURFACE="agent"
  - MODEL (best known), FEATURE (or "none"), BRANCH, USER
  - COMMAND (current command), LABELS (["topic1","topic2",...])
  - LINKS: SPEC/TICKET/ADR/PR (URLs or "null")
  - FILES_YAML: list created/modified files (one per line, " - ")
  - TESTS_YAML: list tests run/added (one per line, " - ")
  - PROMPT_TEXT: full user input (verbatim, not truncated)
  - RESPONSE_TEXT: key assistant output (concise but representative)
  - Any OUTCOME/EVALUATION fields required by the template
- Write the completed file with agent file tools (Write/Edit).
- Confirm absolute path in output.

## 4) Use the sp.phr command file if present

If `.**/commands/sp.phr.*` exists, follow its structure — except for its `create-phr.sh`
instruction, which does not apply here (see the critical constraint above).

## 5) Post-creation validations (must pass)

- No unresolved placeholders (e.g., `{{THIS}}`, `[THAT]`).
- Title, stage, and dates match front-matter.
- PROMPT_TEXT is complete (not truncated).
- File exists at the expected path and is readable.
- Path matches route.

## 6) Report

- Print: ID, path, stage, title.
- On any failure: warn but do not block the main command.
- Skip PHR only for `/sp.phr` itself.
