FROM python:3.12-slim

# Official static uv binary - no pip bootstrap needed.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# Dependencies first: this layer stays cached until pyproject.toml/uv.lock change.
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev

# Application code. Secrets (GEMINI_API_KEY, QDRANT_URL, QDRANT_API_KEY,
# NEON_DATABASE_URL) are injected by the Space's Settings -> Secrets at
# runtime, never baked into the image - .env is excluded via .dockerignore.
COPY *.py ./

RUN useradd -m -u 1000 appuser && chown -R appuser /app
USER appuser

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
