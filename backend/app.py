"""Hugging Face Space entry point (Gradio SDK).

HF's Docker Spaces require a card on file, which is currently declining, so
this Space runs on the free Gradio SDK instead.

Root cause of the recurring "address already in use" on 7860, confirmed by
reading Gradio 6.26's own source (not guessing): when SSR mode is on, both
``gr.mount_gradio_app()`` (gradio/routes.py) and ``Blocks.launch()``
(gradio/blocks.py) unconditionally start a Node.js *front proxy* process
that claims the public port for itself — ``gradio/node_server.py`` defaults
that port to ``int(os.getenv("GRADIO_SERVER_PORT", "7860"))``, i.e. 7860 by
default, and one of blocks.py's own comments notes this exact production
Node-proxy architecture was "observed on HF Spaces". SSR mode isn't
something we ever opted into; it's controlled by the ``GRADIO_SSR_MODE`` env
var, which HF evidently sets on this Space. So `gr.mount_gradio_app()` was
silently starting a Node process bound to 7860 *before* our own
``uvicorn.run(app, port=7860)`` line ever ran — a second server on the same
port, unrelated to Python variable naming (renaming the Gradio object made
no difference, which is what ruled out an earlier, wrong theory: that HF's
platform auto-launches a variable literally named ``demo``).

Fix: pass ``ssr_mode=False`` to ``gr.mount_gradio_app()`` below, so Node
never starts regardless of ``GRADIO_SSR_MODE``. Our own uvicorn.run(app) is
then the only thing that ever binds 7860, on the Space and locally.

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
import spaces
import uvicorn

from main import ChatRequest, app, chat


@spaces.GPU
def _zerogpu_startup_probe() -> None:
    """Satisfies ZeroGPU's "@spaces.GPU function detected" startup check.

    This Space's free-tier hardware is ZeroGPU, which requires at least one
    @spaces.GPU-decorated function to exist or the Space fails to start. The
    chatbot itself only calls Gemini's API and never needs GPU compute, so
    this function is never called — it exists purely for that check.
    """


# Merely decorating the function above registers it locally, but ZeroGPU
# only learns a GPU function exists when `spaces` reports it to HF's backend
# via `spaces.zero.startup()` — which the `spaces` package normally triggers
# by patching `gr.Blocks.launch()` to call it right before the real launch.
# We never call `.launch()` ourselves (we mount the Gradio UI into main.py's
# FastAPI `app` and serve that via our own uvicorn.run() below instead), so
# that patch never fires and the startup check kept failing even with the
# decorated function present. Call it directly so the report goes out
# regardless.
if spaces.config.Config.zero_gpu:
    spaces.zero.startup()


# Keyed by Gradio's per-browser-tab session_hash, so each demo visitor gets
# their own conversation without reusing another visitor's session_id.
_demo_sessions: dict[str, str] = {}


async def respond(message: str, history: list, request: gr.Request) -> str:
    session_id = _demo_sessions.get(request.session_hash)
    result = await chat(ChatRequest(question=message, session_id=session_id))
    _demo_sessions[request.session_hash] = result.session_id
    return result.answer


chat_ui = gr.ChatInterface(
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
#
# ssr_mode=False is required here: when SSR mode is on (as it evidently is
# on this Space, via GRADIO_SSR_MODE), mount_gradio_app() itself starts a
# Node.js front-proxy process that binds our target port (see the module
# docstring) before we ever get to uvicorn.run() below. Forcing it off keeps
# this a single-server setup, which is what we actually want since we're
# already serving everything (FastAPI routes + Gradio UI) from one process.
app = gr.mount_gradio_app(app, chat_ui, path="/", ssr_mode=False)

# The only bind attempt on 7860, both on the Space and locally.
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
