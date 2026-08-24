---
title: Physical AI & Humanoid Robotics Study Assistant
emoji: 🤖
colorFrom: blue
colorTo: indigo
sdk: gradio
app_file: app.py
pinned: false
---

# Physical AI & Humanoid Robotics — backend

RAG chat service for the *Physical AI & Humanoid Robotics* textbook.

- `main.py` — the FastAPI app: retrieval + generation over the book's chapters
  (`/health`, `/ready`, `/chat`, `/chat/history/{session_id}`). This is what the
  React chat widget on the book site talks to.
- `app.py` — Hugging Face Space entry point (Gradio SDK). Mounts the FastAPI
  app above so `/chat` keeps working for the widget, and adds a small
  `gr.ChatInterface` at `/` for manual testing.

Secrets (`GEMINI_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`, `NEON_DATABASE_URL`)
are configured via the Space's Settings → Variables and secrets, never
committed.

## Run locally

```
uv run --project backend python backend/app.py
```
