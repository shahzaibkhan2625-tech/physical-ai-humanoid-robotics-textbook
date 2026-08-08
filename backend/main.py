from fastapi import FastAPI

app = FastAPI(title="Physical AI & Humanoid Robotics Textbook API")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
