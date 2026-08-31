# Physical AI & Humanoid Robotics

**An open textbook on embodied intelligence, with a RAG chatbot that only answers from its own pages.**

[![Deploy book to GitHub Pages](https://github.com/shahzaibkhan2625-tech/physical-ai-humanoid-robotics-textbook/actions/workflows/deploy.yml/badge.svg)](https://github.com/shahzaibkhan2625-tech/physical-ai-humanoid-robotics-textbook/actions/workflows/deploy.yml)
[![Live Book](https://img.shields.io/badge/live%20book-GitHub%20Pages-2ea44f?logo=githubpages&logoColor=white)](https://shahzaibkhan2625-tech.github.io/physical-ai-humanoid-robotics-textbook/)
[![Backend](https://img.shields.io/badge/backend-Hugging%20Face%20Space-yellow?logo=huggingface&logoColor=white)](https://shahzaibkhan0505-physical-ai-chatbot.hf.space)
![Python](https://img.shields.io/badge/python-3.12-3776AB?logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-6.0-3178C6?logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688?logo=fastapi&logoColor=white)
![Docusaurus](https://img.shields.io/badge/Docusaurus-3.10-3ECC5F?logo=docusaurus&logoColor=white)

## Live Demo

| | |
| --- | --- |
| 📖 **Book** | **[shahzaibkhan2625-tech.github.io/physical-ai-humanoid-robotics-textbook](https://shahzaibkhan2625-tech.github.io/physical-ai-humanoid-robotics-textbook/)** |
| 🤖 **Backend API** | **[shahzaibkhan0505-physical-ai-chatbot.hf.space](https://shahzaibkhan0505-physical-ai-chatbot.hf.space)** |

## Screenshots

<!-- Add screenshots to a docs/images or .github folder and update the paths below. -->

| Chat widget with source citations | Urdu translation toggle | Login / signup |
| :---: | :---: | :---: |
| ![Chat widget answering a grounded question with cited sources](PLACEHOLDER_chat_widget.png) | ![Chapter text translated to Urdu with the toggle button visible](PLACEHOLDER_urdu_toggle.png) | ![Signup and login forms for the study assistant](PLACEHOLDER_login.png) |

## What is this

Robotics learning content is either a dense academic paper or a shallow blog post — rarely a text a beginner can work through end to end, with runnable code, on one consistent robot model. This project is a 14-chapter textbook on physical AI and humanoid robotics (ROS 2, simulation, NVIDIA Isaac, and vision-language-action models), paired with a retrieval-augmented chatbot embedded in every page. The chatbot answers *only* from the book's own text — it cites its sources and refuses rather than guesses when the book doesn't cover something, so a reader can trust an answer instead of fact-checking it.

## Table of Contents

- [Live Demo](#live-demo)
- [Screenshots](#screenshots)
- [What is this](#what-is-this)
- [Features](#features)
  - [The Textbook](#the-textbook)
  - [The AI Study Assistant](#the-ai-study-assistant)
  - [Urdu Translation](#urdu-translation)
  - [Accounts & Personalization](#accounts--personalization)
  - [Engineering Practices](#engineering-practices-skills--subagents)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap--future-work)
- [Acknowledgements](#acknowledgements)
- [License / Author](#license--author)

## Features

### The Textbook

14 chapters across 4 modules, each following a fixed shape: learning objectives → theory → runnable code → exercises. One humanoid model is introduced in Chapter 1.4 and reused throughout the book.

- **Module 1 — ROS 2: The Robotic Nervous System** — Introduction to Physical AI & Embodied Intelligence · ROS 2 Architecture (Nodes, Topics, Services) · Bridging Python Agents with `rclpy` · URDF: Describing a Humanoid
- **Module 2 — Gazebo & Unity: The Digital Twin** — Gazebo Setup & Simulation Basics · Physics, Gravity & Collisions · Simulating Sensors (LiDAR, Depth Cameras, IMU) · Unity for Robot Visualization
- **Module 3 — NVIDIA Isaac: The AI-Robot Brain** — Isaac Sim & Synthetic Data · Isaac ROS & Visual SLAM · Nav2: Path Planning for Bipeds
- **Module 4 — Vision-Language-Action (VLA)** — Voice-to-Action with Whisper · Cognitive Planning with LLMs · Capstone: The Autonomous Humanoid

Target platform: **ROS 2 Jazzy Jalisco + Gazebo Harmonic on Ubuntu 24.04**, chosen because NVIDIA Isaac ROS (Module 3) is only tested against Jazzy. All `rclpy` examples use the standard `init()`/`destroy_node()`/`shutdown()` lifecycle — no invented APIs, no pseudo-code.

### The AI Study Assistant

A retrieval-augmented chatbot (`book/src/components/ChatWidget`) embedded on every chapter page.

- **Grounded or silent** — every answer is generated only from passages retrieved out of the book's own content plus conversation history; the model is instructed never to fall back on general knowledge.
- **Source citations** — grounded answers return the module, chapter, and a link into the published book for every passage that informed the answer.
- **Text-selection "Ask AI"** (`book/src/components/SelectionAsk`) — highlight any paragraph and ask a question scoped to that selection; retrieval still runs in the background so related passages elsewhere in the book are still cited.
- **Refuses out-of-scope questions** — if retrieved passages don't clear a relevance threshold, the assistant says so instead of guessing.
- **Conversation history** — each session is persisted to Postgres and restorable by session ID.

### Urdu Translation

A one-click "Translate to Urdu" button (`book/src/components/TranslateButton`) on each chapter, backed by a dedicated (non-RAG) Gemini call. Translations are cached in-process per chapter, so repeat requests for the same chapter are served instantly without a second model call.

### Accounts & Personalization

Signup and login (`book/src/components/Auth`) with:

- **bcrypt** password hashing (`passlib[bcrypt]`), with a hard 72-character cap enforced at signup so bcrypt's own byte limit never truncates a password silently.
- **JWT** (`PyJWT`, HS256) issued on login, sent as a bearer token on `/chat` to personalize answers.
- **Timing-attack mitigation** — a login against a non-existent email still runs a dummy bcrypt verification, so response time doesn't leak whether an email is registered.
- **Generic auth errors** — wrong password and unknown email return the identical `401 invalid_credentials` message.
- **Experience-level adaptive answers** — signup captures a self-reported level (beginner / intermediate / advanced); the chat agent appends a personalization hint for logged-in users so explanations match their level. Logged-out requests still work, just unpersonalized.

### Engineering Practices (Skills & Subagents)

The book's content quality is enforced by a Claude Code pipeline of skills and subagents rather than manual review alone:

| Component | Role |
| --- | --- |
| `chapter-authoring` skill | Encodes the constitution's 4-part chapter shape, the Jazzy target, and per-chapter scope so every chapter draft starts from the same rules. |
| `chapter-writer` subagent | Drafts or revises one chapter by applying the skill above. Authoring only — never reviews its own output. |
| `code-verifier` subagent | Independently checks code examples for valid syntax and real (not invented) `rclpy`/ROS 2 APIs, run in a fresh context with no memory of how the chapter was written. |
| `consistency-checker` subagent | Checks a drafted chapter against the rest of the book — terminology, cross-links instead of re-teaching, the single humanoid model, no forward references. |

Every code example's execution status is tracked in [`specs/001-book/verification-log.md`](specs/001-book/verification-log.md) rather than assumed — see [Known Limitations](#known-limitations).

## Architecture

```
                         ┌─────────────────────────────┐
   Browser  ───────────▶ │  Docusaurus book             │
                         │  (GitHub Pages, static)      │
                         │  ChatWidget · SelectionAsk ·  │
                         │  TranslateButton · Auth       │
                         └───────────────┬───────────────┘
                                         │ fetch() over HTTPS
                                         ▼
                         ┌─────────────────────────────┐
                         │  FastAPI backend              │
                         │  (Hugging Face Space, Gradio  │
                         │  SDK wraps the FastAPI app)   │
                         │  /health /ready /chat         │
                         │  /translate /signup /login    │
                         │  /chat/history/{session_id}   │
                         └───┬───────────┬───────────┬───┘
                             │           │           │
                    embeddings│   vectors│    history/│users
                             ▼           ▼           ▼
                    ┌────────────┐ ┌───────────┐ ┌──────────┐
                    │  Gemini     │ │  Qdrant    │ │  Neon     │
                    │  (genai +   │ │  Cloud     │ │  Postgres │
                    │  Agents SDK)│ │ (book_     │ │           │
                    │             │ │  chapters) │ │           │
                    └────────────┘ └───────────┘ └──────────┘
```

### RAG pipeline

- **Ingestion (one-time / whenever chapter content changes)** — `scripts/ingest.py` walks `book/docs/**/*.mdx`, strips frontmatter, chunks each chapter into ~500-word windows with ~100-word overlap without splitting code from its explaining prose, embeds each chunk with Gemini (`gemini-embedding-001`, 3072-dim), and upserts into a Qdrant collection (`book_chapters`, cosine distance) with deterministic IDs so re-running never duplicates content.
- **Retrieval + generation (per request)** — `POST /chat` embeds the question, searches Qdrant for the top 5 passages, drops anything below `RELEVANCE_THRESHOLD`, and runs an OpenAI-Agents-SDK agent pointed at Gemini's OpenAI-compatible endpoint, constrained to answer only from the retrieved passages and prior conversation turns. The turn is persisted to Neon Postgres; the response reports whether persistence succeeded.

### Security choices

- Passwords hashed with **bcrypt** via `passlib`, never stored or logged in plaintext.
- **JWT** (HS256, 24h default expiry) issued at login; `/chat` decodes it only to personalize — an invalid or missing token still answers, just without personalization.
- **Timing-attack mitigation** on login: a dummy bcrypt verification runs even when the email doesn't exist, so failure response time doesn't reveal which case occurred.
- **Generic error messages** for auth failures — never distinguishes "wrong password" from "no such account" in the response.
- **Grounding as an anti-hallucination control**: client-supplied text (the question, a selected passage) is always treated as data, never as instructions that can change system behavior — an "ignore previous instructions" style question is discussed as data, not obeyed.

## Tech Stack

| Category | Technology | Purpose |
| --- | --- | --- |
| Book site | Docusaurus 3.10 (TypeScript, React 19) | Static textbook site, docs-only mode |
| Book hosting | GitHub Pages | Free static hosting, deployed via GitHub Actions |
| Backend API | FastAPI 0.141 on Python 3.12 (managed by `uv`) | RAG chat, translation, and auth endpoints |
| Backend hosting | Hugging Face Spaces (Gradio SDK) | Wraps the FastAPI app; `/chat` etc. still work unchanged |
| Generation & embeddings | Google Gemini (`google-genai`) | Answer generation, translation, and 3072-dim embeddings |
| Agent framework | `openai-agents`, pointed at Gemini's OpenAI-compatible endpoint | Grounded, tool-constrained chat generation |
| Vector search | Qdrant Cloud | Semantic retrieval over indexed book chunks |
| Database | Neon Postgres (`psycopg`) | Chat history and user accounts |
| Auth | `passlib[bcrypt]`, `PyJWT` | Password hashing, JWT issuance/verification |
| Spec-driven workflow | Spec-Kit Plus (`specifyplus`) | Spec/plan/tasks artifacts under `specs/`, PHR history under `history/prompts/` |

## API Reference

Base URL: `https://shahzaibkhan0505-physical-ai-chatbot.hf.space`

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness check — process is up. |
| `GET` | `/ready` | Readiness — checks the Qdrant index, a live Gemini embedding call, and Neon connectivity; reports whether the service can actually answer. |
| `POST` | `/chat` | Ask a grounded question. Optional `session_id` continues a conversation; optional `selected_text` scopes the answer to a highlighted passage; optional bearer JWT personalizes by experience level. |
| `GET` | `/chat/history/{session_id}` | Full ordered turn history for a session, for widget restore. |
| `POST` | `/translate` | Translate chapter text to Urdu (cached per `chapter_id`). |
| `POST` | `/signup` | Create an account (email, password, experience level). |
| `POST` | `/login` | Verify credentials, return a bearer JWT. |

Every error response is `{"error": <code>, "message": <string>}`, with `<code>` one of `bad_request`, `unknown_session`, `index_not_built`, `dependency_unavailable`, `timeout`, `invalid_credentials` — never exposing credentials or connection details.

## Getting Started

### Prerequisites

- **Python 3.12** exactly (`uv python install 3.12`) — the backend does not run on 3.13+.
- **Node.js 20+** (CI uses Node 24).
- [`uv`](https://docs.astral.sh/uv/) for backend dependency management.
- Accounts/keys for: [Google AI Studio](https://aistudio.google.com/) (Gemini), [Qdrant Cloud](https://cloud.qdrant.io/), [Neon](https://neon.tech/) (Postgres).

### Environment variables

Copy `.env.example` to `.env` at the repo root and fill in your own values:

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Google Gemini API key — generation, translation, and embeddings. Startup fails without it. |
| `QDRANT_URL` | Yes | Qdrant Cloud cluster URL. |
| `QDRANT_API_KEY` | Yes | Qdrant Cloud API key. |
| `NEON_DATABASE_URL` | No | Neon Postgres connection string. Chat and translation work without it; history, signup, and login degrade. |
| `JWT_SECRET_KEY` | No | Signs JWTs issued by `POST /login`. `/login` fails (503) without it. Generate with `python -c "import secrets; print(secrets.token_hex(32))"`. |
| `GEMINI_CHAT_MODEL` | No | Gemini model for generation. Default: `gemini-3.6-flash`. |
| `RELEVANCE_THRESHOLD` | No | Minimum cosine similarity for a retrieved passage to count. Default: `0.66`. |
| `CORS_ORIGINS` | No | Comma-separated allowed browser origins for the chat widget. Default: `*`. |
| `BOOK_BASE_URL` | No | Public base URL of the published book, used to build source links. Defaults to the live GitHub Pages URL. |
| `JWT_EXPIRE_MINUTES` | No | JWT lifetime in minutes. Default: `1440` (24h). |

### Backend setup

```powershell
cd backend
uv sync
uv run uvicorn main:app --reload    # http://127.0.0.1:8000/health
```

`uv sync` creates `backend/.venv` and installs pinned dependencies from `uv.lock` — no global installs required.

### Book setup

```powershell
cd book
npm install
npm start          # dev server on http://localhost:3000, talks to localhost:8000
npm run build       # static build into book/build, talks to the deployed backend
```

### Data setup

Run once against a fresh database, and again whenever chapter content changes:

```powershell
# 1. Create/verify the chat_history and users tables (idempotent — safe to re-run)
backend/.venv/Scripts/python.exe scripts/init_db.py

# 2. Chunk, embed, and index book/docs/**/*.mdx into Qdrant
backend/.venv/Scripts/python.exe scripts/ingest.py            # full run
backend/.venv/Scripts/python.exe scripts/ingest.py --dry-run  # chunk/report only, no writes
backend/.venv/Scripts/python.exe scripts/ingest.py --resume   # skip already-indexed chunks
```

`init_db.py` must run before `ingest.py` and before the backend can serve `/chat` — `/ready` reports `index_not_built` until the index exists.

## Project Structure

```
.
├── backend/                 FastAPI RAG service
│   ├── app.py                Hugging Face Space entry point (Gradio wrapper over main:app)
│   ├── main.py                FastAPI app: chat, translate, auth, history endpoints
│   ├── Dockerfile             Alternative plain-FastAPI container (uvicorn main:app)
│   └── pyproject.toml / uv.lock / requirements.txt
├── book/                    Docusaurus site (the textbook)
│   ├── docusaurus.config.ts   Site config, chat API URL resolution
│   ├── docs/                  Chapter content
│   │   ├── ros2/                Module 1 — ROS 2
│   │   ├── digital-twin/        Module 2 — Gazebo & Unity
│   │   ├── isaac/                Module 3 — NVIDIA Isaac
│   │   └── vla/                  Module 4 — Vision-Language-Action
│   └── src/components/        ChatWidget/, SelectionAsk/, TranslateButton/, Auth/
├── scripts/                 ingest.py, init_db.py — offline data setup
├── specs/                   Spec-Kit Plus specs
│   ├── 001-book/               spec, plan, tasks, data model, verification log
│   └── 002-chatbot/             spec, checklists
├── history/prompts/         Prompt History Records (PHRs), by feature
├── .claude/                 Skills, subagents, and commands
├── .github/workflows/       deploy.yml — book → GitHub Pages
└── .env.example              Documented environment variables
```

## Development Workflow

This project follows spec-driven development with [Spec-Kit Plus](https://github.com/panaversity/spec-kit-plus): every feature starts as a `spec.md` under `specs/`, moves through `plan.md` and `tasks.md`, and is implemented against those artifacts rather than ad hoc. Chapter content is additionally split into `drafted` (written and reviewed, code not executed) and `verified` (every example actually run, producing the stated result) — see [`specs/001-book/verification-log.md`](specs/001-book/verification-log.md) for the current state of each chapter. Each module is reviewed by the `code-verifier` and `consistency-checker` subagents independently before being considered drafted-complete. Every prompt exchanged with the AI assistant is recorded as a Prompt History Record under `history/prompts/`, giving a full audit trail of how the book and backend were built.

## Known Limitations

Honest status, not a marketing page — see [`specs/001-book/verification-log.md`](specs/001-book/verification-log.md) for full detail:

- **Only 1 of 14 chapters is fully `verified`** (every example executed and confirmed). The other chapters are `drafted` — reviewed and statically checked, but most examples require ROS 2 / Gazebo / GUI rendering / GPU environments not available on the authoring machine, so they're `pending-env` rather than executed.
- **Two examples are GPU-blocked, not merely pending** — Isaac Sim synthetic data generation (3.1) and Isaac ROS Visual SLAM (3.2) both require an RTX-class GPU with no software substitute, and no such hardware is available. These cannot meet the "verified" bar without a hardware decision.
- **Two known code defects are logged and not yet fixed**: Chapter 3.3's support-polygon check drops a 0.04 m offset and misreports a standing robot as falling; Chapter 4.3's mission trace references a `STOP` skill that isn't in the grounded skill registry.
- **Translation cache is in-process memory**, not persisted or shared across instances — it resets on every backend restart/redeploy, and an edited chapter keeps serving its old translation until then.
- **No rate limiting yet.** `POST /chat` and `/translate` have no per-client request cap, so nothing currently stops one client from driving unbounded model API cost — flagged as a required-before-production item in the chatbot spec (NFR-004), not yet implemented.
- **Conversation IDs are the only access control** on `/chat/history/{session_id}` — there's no authentication tying a session to a user, so anyone holding a session ID can read that conversation.
- **Answers are non-streaming** — `/chat` returns the complete answer in one response; there's no token-by-token streaming yet.

## Roadmap / Future Work

- Reach `verified` status on the remaining 13 chapters as ROS 2/Gazebo/GPU environments become available; resolve the two logged code defects.
- Add per-client rate limiting to `/chat` and `/translate` (spec'd, not yet built).
- Move the translation cache to a persistent store (e.g., a Postgres table) so it survives backend restarts.
- Stream `/chat` responses token-by-token instead of waiting for the full answer.
- Make Module 3's examples reproducible without local GPU hardware — e.g. a documented cloud-GPU or headless-rendering path.

## Acknowledgements

Built for Panaversity's **Hackathon I: Physical AI & Humanoid Robotics Textbook**. Authored with [Claude Code](https://claude.com/claude-code) using a spec-driven workflow ([Spec-Kit Plus](https://github.com/panaversity/spec-kit-plus)) and a chapter-authoring/code-verification pipeline built on Claude subagents and skills.

## License / Author

No license file is currently published for this repository — all rights reserved by default until one is added.

Author: [shahzaibkhan2625-tech](https://github.com/shahzaibkhan2625-tech)
