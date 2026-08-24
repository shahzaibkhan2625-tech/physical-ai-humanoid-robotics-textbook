"""Hugging Face Space entry point (Gradio SDK).

HF's Docker Spaces require a card on file, which is currently declining, so
this Space runs on the free Gradio SDK instead. Gradio SDK Spaces execute
this file directly (no Dockerfile) and expect a served app by the time it
finishes running.

``main.py`` is untouched: it still owns the RAG logic and the FastAPI app
(``/health``, ``/ready``, ``/chat``, ``/chat/history/{session_id}``) that the
React widget calls. This file only adds a thin Gradio layer on top:

- ``gr.mount_gradio_app`` mounts a Gradio UI onto that same FastAPI app, so
  ``/chat`` keeps working unchanged for the widget while the Gradio UI serves
  from ``/``.
- A ``gr.ChatInterface`` gives a manual click-and-type demo of the same RAG
  pipeline, for testing without the book site.

Run locally the same way Spaces runs it:
    uv run --project backend python backend/app.py
"""

from __future__ import annotations

import gradio as gr
import uvicorn

from main import ChatRequest, app, chat

# Keyed by Gradio's per-browser-tab session_hash, so each demo visitor gets
# their own conversation without reusing another visitor's session_id.
_demo_sessions: dict[str, str] = {}


async def respond(message: str, history: list, request: gr.Request) -> str:
    session_id = _demo_sessions.get(request.session_hash)
    result = await chat(ChatRequest(question=message, session_id=session_id))
    _demo_sessions[request.session_hash] = result.session_id
    return result.answer


demo = gr.ChatInterface(
    fn=respond,
    title="Physical AI & Humanoid Robotics — Study Assistant",
    description=(
        "Manual demo of the book's RAG chat service. The production chat "
        "widget on the book site talks to `/chat` directly, not this UI."
    ),
    examples=[
        "What is a URDF used for?",
        "How does ROS 2 differ from ROS 1?",
    ],
)

# Mounting at "/" is safe: main.py's own routes (/health, /chat, ...) were
# registered on `app` before this call, and Starlette matches routes in
# registration order, so they take priority over the catch-all mount.
app = gr.mount_gradio_app(app, demo, path="/")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
