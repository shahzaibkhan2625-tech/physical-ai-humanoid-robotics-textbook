---
id: 0008
title: Deploy Book Via GitHub Actions
stage: general
date: 2026-08-09
surface: agent
model: claude-opus-5[1m]
feature: none
branch: main
user: shahzaibkhan2625-tech
command: none (direct request — Phase 2 deployment pipeline)
labels: ["deployment", "github-pages", "github-actions", "docusaurus", "ci", "phase-2"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .github/workflows/deploy.yml
  - history/prompts/general/0008-deploy-book-github-pages-actions.general.prompt.md
tests:
  - "npm run build (in book/) — PASS, generated static files in book/build"
  - "build output inspected: 404.html, .nojekyll, sitemap.xml present; 21 baseUrl-prefixed refs in index.html"
---

## Prompt

Phase 2: deploy the (currently near-empty) Docusaurus book to GitHub Pages
via GitHub Actions. Goal is to prove the deployment pipeline works now, before
real content exists.

## Research first
Read the current Docusaurus 3 official guide for deploying to GitHub Pages
using GitHub Actions (not the manual gh-pages branch method). Confirm the
correct workflow syntax and config requirements before writing anything.
State what you found.

## Context
- Repo: shahzaibkhan2625-tech/physical-ai-humanoid-robotics-textbook
- Book lives in book/ (Docusaurus 3, docs-only)
- GitHub Pages Source is already set to "GitHub Actions" in repo settings
- baseUrl is /physical-ai-humanoid-robotics-textbook/ and url is
  https://shahzaibkhan2625-tech.github.io — verify these are correct for a
  project-site deployment, do not change unless wrong

## Task
- Create .github/workflows/deploy.yml that, on push to main:
  - checks out the repo
  - installs Node and dependencies inside book/
  - runs the Docusaurus production build
  - deploys the build output to GitHub Pages using the official
    actions/deploy-pages flow
- The workflow must only build book/, not touch backend/
- Use the correct permissions and concurrency settings the official guide
  specifies for Pages deployment

## Constraints
- Do not hardcode secrets; Pages deployment uses the built-in GITHUB_TOKEN
- Explain each part of the workflow file after writing it
- Do not deploy manually or push — I will push myself from a separate terminal

## Summary at end
- What the workflow does, step by step
- Anything I must verify in repo settings
- The exact URL the site will be live at once it runs

## Response snapshot

**Research.** Read the Docusaurus deployment guide (docusaurus.io/docs/deployment and
/docs/next/deployment/github-pages) and GitHub's own Pages starter workflow
(actions/starter-workflows `pages/static.yml`). Findings:

- Docusaurus's official Actions flow is a two-job workflow — `build` then `deploy` — using
  `actions/checkout@v4` (`fetch-depth: 0`), `actions/setup-node@v4` (`node-version: 24`,
  `cache: npm`), `npm ci`, `npm run build`, `actions/upload-pages-artifact@v3` (`path: build`),
  and `actions/deploy-pages@v4` in a `github-pages` environment.
- The Docusaurus guide sets `permissions` **only on the deploy job** (`pages: write`,
  `id-token: write`) and specifies **no concurrency block at all**. The request asked for "the
  correct permissions and concurrency settings the official guide specifies", so the gap was
  filled from GitHub's own Pages starter workflow, which is the authoritative source for both:
  `permissions: {contents: read, pages: write, id-token: write}` and
  `concurrency: {group: "pages", cancel-in-progress: false}` — false because an in-flight
  production deploy should be allowed to finish.
- Config requirements confirmed: `url`, `baseUrl`, `organizationName`, `projectName`, and a
  `trailingSlash` that is explicitly `true` or `false`, "not `undefined`".

**Verification of existing config** (`book/docusaurus.config.ts`): `url`, `baseUrl`,
`organizationName`, and `projectName` are all correct for a project-site deployment — left
unchanged as instructed. One gap found and **reported but not changed**: `trailingSlash` is unset,
which the official guide explicitly recommends against. Deployment works without it; flagged for
the user's decision since the instruction was not to touch config unless wrong.

**Workflow written** to `.github/workflows/deploy.yml`, adapted from the official flow for a
subdirectory layout. Three subdirectory-specific adaptations, each necessary:
`defaults.run.working-directory: book` (scopes every `run` step to book/, so backend/ is never
touched); `cache-dependency-path: book/package-lock.json` (setup-node's cache input is not
affected by `working-directory` and would otherwise fail to find a lockfile at the repo root);
and `path: book/build` on the artifact upload (same reason — action inputs are workspace-relative).
Also added `workflow_dispatch` so a deployment can be re-run from the Actions tab without a commit.

**Verified locally**: `npm run build` in book/ succeeds on Node 24.11.1 (matching the workflow's
Node 24). Build output contains `404.html`, `.nojekyll`, `sitemap.xml`, and 21 baseUrl-prefixed
references in `index.html`, confirming `baseUrl` is applied. `book/build` is already gitignored.

No push, no manual deploy, no secrets. `npm ci` is satisfiable — `book/package-lock.json` exists.

## Outcome

- ✅ Impact: The Pages deployment pipeline exists and its riskiest step (the production build) is
  proven green locally before the first push, which was the stated goal of doing this while the
  book is near-empty.
- 🧪 Tests: `npm run build` in book/ — PASS. Build output structure and baseUrl application
  inspected and confirmed. The workflow itself is unexercised until pushed to main.
- 📁 Files: `.github/workflows/deploy.yml` (new), this PHR.
- 🔁 Next prompts: user pushes to main from their own terminal; then confirm the run is green and
  the site resolves at https://shahzaibkhan2625-tech.github.io/physical-ai-humanoid-robotics-textbook/.
  Optionally set `trailingSlash` and add a `test-deploy.yml` PR-time build check.
- 🧠 Reflection: The Docusaurus guide and GitHub's Pages guide each hold half the answer — the
  former has the build shape, the latter has the workflow-level permissions and concurrency. Taking
  only the Docusaurus version would have satisfied the letter of "the official guide" while
  omitting the concurrency control the request explicitly asked for.

## Evaluation notes (flywheel)

- Failure modes observed: the docs URL `docusaurus.io/docs/deployment/github-pages` 404s (the live
  path is `/docs/next/deployment/github-pages`), and the raw MDX source path in the docusaurus repo
  has moved; both needed a second fetch against a different URL. Worth going to the rendered docs
  page first rather than guessing raw GitHub paths.
- Graders run and results (PASS/FAIL): local production build PASS; workflow syntax not machine-
  validated (no act/actionlint run) — first real grade is the Actions run after push.
- Prompt variant (if applicable): none.
- Next experiment (smallest change to try): after the first green run, add `test-deploy.yml` (build
  only, no deploy) on pull requests, so a broken chapter fails in review rather than on main.
