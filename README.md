# Physical AI & Humanoid Robotics Textbook

An open textbook on physical AI and humanoid robotics, with a retrieval-augmented
chatbot that answers questions grounded in the book's own content.

Submission for Panaversity's *Hackathon I: Physical AI & Humanoid Robotics Textbook*.

## Stack

| Layer | Technology |
| --- | --- |
| Book site | Docusaurus 3 (TypeScript, classic preset, docs-only) |
| Book hosting | GitHub Pages |
| Backend API | FastAPI, managed by uv on Python 3.12 |
| Backend hosting | Hugging Face Spaces |
| Generation & embeddings | Google Gemini (`google-genai`) |
| Agent framework | `openai-agents` |
| Vector search | Qdrant Cloud |
| Chat history | Neon Postgres (`psycopg`) |
| Spec-driven workflow | Spec-Kit Plus (`specifyplus`) |

## Layout

```
book/       Docusaurus site (the textbook)
backend/    FastAPI RAG service
scripts/    ingestion / tooling scripts
.claude/    Claude Code commands, subagents and skills
.specify/   Spec-Kit Plus templates, memory and specs
```

## Local setup

Prerequisites: Node 20+, [uv](https://docs.astral.sh/uv/), and Python 3.12
(`uv python install 3.12`).

Copy the environment template and fill in your own credentials:

```powershell
Copy-Item .env.example .env
```

### Book

```powershell
cd book
npm install
npm start          # dev server on http://localhost:3000
npm run build      # static build into book/build
```

### Backend

```powershell
cd backend
uv sync
uv run uvicorn main:app --reload    # http://127.0.0.1:8000/health
```

`uv sync` creates `backend/.venv` and installs pinned dependencies from
`uv.lock`. No global installs are required.
