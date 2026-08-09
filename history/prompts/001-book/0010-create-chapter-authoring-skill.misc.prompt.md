---
id: 0010
title: Create Chapter Authoring Skill
stage: misc
date: 2026-08-09
surface: agent
model: claude-opus-5[1m]
feature: 001-book
branch: main
user: shahzaibkhan2625-tech
command: none (direct request — Phase 3 Step 2, Bonus A deliverable)
labels: ["skill", "agent-skills", "tooling", "chapter-authoring", "bonus-a", "book", "ros2-jazzy"]
links:
  spec: specs/001-book/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - .claude/skills/chapter-authoring/SKILL.md
  - history/prompts/001-book/0010-create-chapter-authoring-skill.misc.prompt.md
tests:
  - "Frontmatter validated against documented limits: name 17/64 chars, lowercase-hyphen charset, no reserved words; description 356/1024; description+when_to_use 543/1536 listing cap — PASS"
  - "Body length 1374 words, within the under-5k-token guidance for SKILL.md bodies — PASS"
---

## Prompt

Phase 3, Step 2: create a reusable Agent Skill that defines how every book
chapter is written. This is part of the Bonus A deliverable (Claude Code
Skills + Subagents).

## Context
- Book target: ROS 2 Jazzy + Gazebo Harmonic + Ubuntu 24.04 (confirmed in
  specs/001-book/spec.md Assumption 2).
- The book spec (specs/001-book/spec.md) defines 14 chapters across 4 modules
  and a fixed chapter shape.
- The constitution (.specify/memory/constitution.md) defines the principles:
  learner-first, runnable code only, verify against docs, teach the why,
  4-part chapter structure.

## Task
Create a skill at .claude/skills/chapter-authoring/SKILL.md that encodes how to
write one chapter for this book. It must capture:
- The required 4-part structure: learning objectives, theory, 1-2 runnable
  code examples, exercises — in that order.
- Frontmatter rules: sidebar_position, title, and correct placement in the
  module folder.
- Depth: moderate, leaning light (per constitution).
- Code rules: Python/rclpy where applicable; Jazzy idiom only
  (rclpy.init()/destroy_node()/rclpy.shutdown(), NOT the context-manager form
  or AsyncNode); every example states its assumed environment.
- The "teach the why" rule: motivation before mechanism.
- Verification: robotics claims checked against official docs, not memory.
- Cross-linking instead of re-teaching; consistent terminology.
- What "done" means for a chapter (the constitution's quality gates).

## Research first
Before writing, check the current correct format for a Claude Code Agent Skill
(SKILL.md structure, frontmatter/metadata it expects). Use the official Claude
Code docs. State what the required format is before writing the file.

## Constraints
- The skill is instructions for writing chapters — it does NOT write any
  chapter itself now.
- Keep it practical and specific to THIS book, not generic advice.
- Explain the skill's structure after creating it.

## Summary at end
- The SKILL.md format you used and why
- What the skill enforces
- How it will be used when writing chapters

## Response snapshot

**Research.** Read the official docs at `code.claude.com/docs/en/skills` and
`platform.claude.com/docs/en/agents-and-tools/agent-skills/overview` (both redirected from the old
`docs.claude.com` paths). Confirmed format:

- Location: `.claude/skills/<name>/SKILL.md` (project) or `~/.claude/skills/` (personal).
- Only `name` and `description` matter for discovery. `name`: ≤64 chars, lowercase/numbers/hyphens
  only, no XML tags, must not contain "anthropic" or "claude". `description`: non-empty, ≤1024
  chars, must state both *what* it does and *when* to use it.
- Claude Code additionally accepts `when_to_use`, `argument-hint`, `arguments`,
  `disable-model-invocation`, `user-invocable`, `allowed-tools`, `disallowed-tools`, `model`,
  `effort`, `context`, `agent`, `background`, `hooks`, `paths`, `shell`, `metadata`, `license`,
  `compatibility`. Outside Claude Code only the Agent Skills spec subset is portable
  (`name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`).
- Progressive disclosure: metadata always loaded (~100 tokens), body loaded on trigger (target
  under 5k tokens), bundled files loaded only when read.

**Fields used**: `name`, `description`, `when_to_use`, `argument-hint`. Deliberately omitted:
`disable-model-invocation` (auto-triggering on chapter work is wanted), `allowed-tools` (no reason
to pre-approve permissions), and `paths` (would restrict automatic loading to open files under
`book/docs/`, missing plain requests like "write chapter 1.2").

**Design decision — no bundled reference files.** Progressive disclosure would normally argue for
putting the 14-chapter catalog in a Level 3 file, but that catalog already lives in
`specs/001-book/spec.md`. The skill points at it instead of copying it, keeping one source of
truth and avoiding drift.

**Structure**: eight ordered steps — load the chapter's contract from the spec and constitution;
placement and frontmatter; the four parts in order; code rules; doc verification; fit with the
rest of the book; depth; done checklist.

**Content specific to this book, not generic advice**: a correct/incorrect `rclpy` code pair for
the Jazzy vs Lyrical init idiom with the reason copied examples fail; a source table naming the
exact doc site per topic and the `jazzy` branch of `ros2/examples`; the `docs.ros.org` Anubis
block recorded as a known obstacle with the GitHub fallback; the actions-in-3.3 ordering rule;
the one-humanoid rule; the "out-of-scope list is the depth control" instruction; and the
split-don't-expand rule with the requirement to raise it rather than silently change the catalog.

**Validated** against the documented limits: name 17/64, charset and reserved-word checks pass,
description 356/1024, description + `when_to_use` 543/1536, body 1374 words.

No chapter content written.

## Outcome

- ✅ Impact: Chapter quality is now enforced by a loadable procedure rather than by remembering
  the constitution each time. The highest-risk, most repeatable failure — copying the modern
  `rclpy` idiom into a Jazzy-targeted book — is called out explicitly with correct and incorrect
  code side by side.
- 🧪 Tests: Frontmatter validated against every documented constraint (name charset/length,
  reserved words, description length, listing cap). Body within the size guidance. The skill's
  real test is its first chapter invocation.
- 📁 Files: `.claude/skills/chapter-authoring/SKILL.md` (new), this PHR.
- 🔁 Next prompts: invoke `/chapter-authoring 1.1` to write the first chapter. Consider a
  companion review skill or subagent that checks a finished chapter against Step 8 independently
  of the author.
- 🧠 Reflection: The temptation was to restate the constitution inside the skill. Pointing at
  `specs/001-book/spec.md` and `.specify/memory/constitution.md` instead keeps the skill small and
  keeps the spec authoritative — a skill that duplicates its source becomes wrong the first time
  the source changes. The parts worth hard-coding were the ones a writer cannot derive: the Jazzy
  idiom trap and the unreachable-docs workaround.

## Evaluation notes (flywheel)

- Failure modes observed: both official doc URLs 301/302-redirected to new hosts
  (`code.claude.com`, `platform.claude.com`) and needed a second fetch. The Claude Code skills
  page is ~80KB and was persisted to a file rather than loaded whole — the frontmatter reference
  table had to be read by offset.
- Graders run and results (PASS/FAIL): frontmatter constraint checks PASS (5/5); body size within
  guidance PASS. No runtime invocation test yet.
- Prompt variant (if applicable): none.
- Next experiment (smallest change to try): after Chapter 1.1 is drafted, check whether Step 8's
  checklist actually caught anything. If the author agent self-reports all gates green every time,
  the gates need an independent reviewer rather than a self-check.
