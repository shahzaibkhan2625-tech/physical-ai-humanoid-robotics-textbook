---
id: 0011
title: Create Book Workflow Subagents
stage: misc
date: 2026-08-09
surface: agent
model: claude-opus-5[1m]
feature: 001-book
branch: main
user: shahzaibkhan2625-tech
command: none (direct request — Phase 3 Step 3, Bonus A deliverable)
labels: ["subagents", "agents", "tooling", "review", "bonus-a", "book", "ros2-jazzy"]
links:
  spec: specs/001-book/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - .claude/agents/chapter-writer.md
  - .claude/agents/code-verifier.md
  - .claude/agents/consistency-checker.md
  - history/prompts/001-book/0011-create-book-workflow-subagents.misc.prompt.md
tests:
  - "Agent names validated: lowercase-hyphen charset, no ':' character — 3/3 PASS"
  - "Prescribed Python syntax-check command executed against valid and invalid samples: exit 0 / exit 1 with SyntaxError — PASS"
---

## Prompt

Phase 3, Step 3: create the subagents for the book workflow. This completes
the Bonus A deliverable (Claude Code Skills + Subagents).

## Research first
Check the current official format for Claude Code subagents — where they live
(.claude/agents/), the file structure, and the frontmatter/metadata they
require (name, description, tools, model, etc.). Use the official Claude Code
docs. State the required format before writing anything.

## Context
- Skill already exists: .claude/skills/chapter-authoring/SKILL.md defines how
  a chapter is written.
- Book spec: specs/001-book/spec.md (14 chapters, 4 modules, chapter shape).
- Constitution: .specify/memory/constitution.md (runnable code, verify vs
  docs, teach the why).
- Target: ROS 2 Jazzy + Gazebo Harmonic + Ubuntu 24.04.

## Task — create three subagents under .claude/agents/

1. chapter-writer — writes one chapter by applying the chapter-authoring
   skill. Produces the full 4-part chapter. Its job is authoring only.

2. code-verifier — independently checks the code examples in a chapter:
   Python syntax validity, that rclpy/ROS 2 APIs used are real and correct for
   Jazzy (not invented, not Lyrical-only idioms), imports present, and that the
   stated environment matches the code. Reports problems; does NOT rewrite the
   chapter. Must run with fresh context, independent of the writer.

3. consistency-checker — checks a chapter against the rest of the book:
   consistent terminology, correct cross-links (no re-teaching, no forward
   references), the single humanoid model is respected, chapter shape present.
   Reports problems only.

## Why separate agents
The writer cannot reliably review its own work — a fresh-context reviewer
catches what the author misses. Verifier and checker must be independent.

## Constraints
- These agents define roles; they do NOT write any chapter now.
- Give each only the tools it needs (e.g. verifier/checker are read + analyze,
  not broad write access).
- Keep each agent focused and specific to this book.
- Explain each agent after creating it.

## Summary at end
- The subagent format you used and why
- Each agent's role, tools, and how it will be invoked
- How the three work together when writing a chapter

## Response snapshot

**Research.** Read `code.claude.com/docs/en/sub-agents`. Confirmed format: Markdown files with
YAML frontmatter in `.claude/agents/` (project, checked into version control) or
`~/.claude/agents/` (personal). Only `name` and `description` are required. `name` must be
lowercase letters and hyphens and cannot contain `:`. `description` tells Claude when to delegate.
`tools` is a comma-separated allowlist — **omitting it inherits every tool**, so restriction
requires stating it. Other optional fields: `disallowedTools`, `model` (`sonnet`/`opus`/`haiku`/
`fable`/full ID/`inherit`, default `inherit`), `skills`, `permissionMode`, `maxTurns`, `memory`,
`effort`, `isolation`, `background`, `color`, `hooks`, `mcpServers`, `initialPrompt`. The body
becomes the subagent's entire system prompt — subagents do not receive the main Claude Code system
prompt. Also noted: to preload a Skill, use the `skills` field rather than listing `Skill` in
`tools`.

**Three agents created.**

- `chapter-writer` — tools Read, Write, Edit, Glob, Grep, WebFetch, WebSearch, Bash, PowerShell;
  `skills: chapter-authoring`. Authoring only, explicitly forbidden from reviewing its own work or
  editing other chapters, the spec, or the constitution.
- `code-verifier` — tools Read, Glob, Grep, WebFetch, WebSearch, Bash, PowerShell. **No Write or
  Edit.** Checks syntax, imports and completeness, real-vs-invented APIs, the Jazzy-vs-Lyrical
  idiom table, stated-environment/code agreement, and claimed results.
- `consistency-checker` — tools Read, Glob, Grep only. **No Write, Edit, or web access** — its
  job is internal to the book. Eleven checks covering chapter shape, objectives-vs-catalog,
  scope, cross-links, forward references, the single humanoid, terminology, prerequisites and
  links, out-of-bounds references, depth and audience, and motivation-before-mechanism.

**Design decisions.**

- `skills: chapter-authoring` is preloaded into the writer *and* the code-verifier, so both work
  from one source of the standard rather than duplicating the Jazzy rules across agent files. The
  verifier's body states explicitly that the skill is "the standard you check against, not
  instructions to carry out", so a read-only agent does not start authoring.
  `consistency-checker` does not preload it — its criteria come from the spec and the neighbouring
  chapters, not from the authoring procedure.
- `model: inherit` on all three. Independence comes from fresh context, not from a different model
  tier, and inheriting respects whatever model the session is using.
- Both reviewers require **evidence** in every finding — a source URL for the verifier, a quoted
  conflicting passage for the checker — and both are told to report zero findings when there are
  none rather than padding.

**Honest limitation recorded in `chapter-writer`.** The development machine is Windows with no
ROS 2, Gazebo, or Isaac. Principle II requires every example to be executed, and that cannot
happen here for ROS/simulator examples. Rather than let the agent quietly claim success, its
prompt requires it to run what it can (Python syntax, XML well-formedness, `npm run build`) and
to list every unexecuted example with the environment needed — "an unrun example is a known gap to
hand back, not a detail to omit."

**Verified the prescribed tooling.** Ran the `ast.parse` syntax-check command the verifier is told
to use against a valid and an invalid sample: exit 0 and exit 1 with a located `SyntaxError`. That
test surfaced a real gap — the machine's default interpreter is Python 3.14 while Jazzy targets
Python 3.12, so a clean parse on 3.14 is evidence rather than proof. Added a caveat to
`code-verifier` requiring it to report the interpreter version and flag post-3.12 syntax.

No chapter content written.

## Outcome

- ✅ Impact: The book now has a three-role pipeline with review separated from authorship, which
  was the gap flagged at the end of PHR 0010 — the skill's Step 8 was a self-check, and a
  self-checking author reports all gates green.
- 🧪 Tests: Agent names validated against the documented charset and `:` restriction (3/3). The
  syntax-check command the verifier prescribes was executed against valid and invalid input and
  behaves as documented.
- 📁 Files: `.claude/agents/chapter-writer.md`, `.claude/agents/code-verifier.md`,
  `.claude/agents/consistency-checker.md` (all new), this PHR.
- 🔁 Next prompts: run the pipeline on Chapter 1.1 — `chapter-writer`, then `code-verifier` and
  `consistency-checker` in parallel. Decide how ROS-dependent examples get executed before the
  book is published, since the current machine cannot run them.
- 🧠 Reflection: The tool allowlist is where the design is actually enforced. `tools` inherits
  everything when omitted, so "reports problems, does not rewrite" is only real because Write and
  Edit are absent from both reviewers' lists — the instruction alone would not have held. Testing
  the command I told the verifier to run also proved worthwhile: it exposed the 3.14-vs-3.12
  interpreter gap, which no amount of re-reading the file would have surfaced.

## Evaluation notes (flywheel)

- Failure modes observed: the subagents doc is ~94KB and had to be persisted and read by offset
  rather than loaded whole — the same pattern as the skills doc in PHR 0010. Worth going straight
  to a targeted grep of the frontmatter table on large doc pages.
- Graders run and results (PASS/FAIL): name validation PASS 3/3; prescribed syntax-check command
  PASS on both positive and negative cases. No end-to-end pipeline run yet.
- Prompt variant (if applicable): none.
- Next experiment (smallest change to try): on Chapter 1.1, run both reviewers and compare their
  findings against a manual read. If the reviewers return "pass" on a chapter a human finds fault
  with, the fix is sharper severity definitions, not longer checklists.
