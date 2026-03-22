from fastapi import FastAPI
from app.api.routes import auth, scenarios, sessions, profile, leaderboard

app = FastAPI(title="DebateAI")

app.include_router(auth.router)
app.include_router(scenarios.router)
app.include_router(sessions.router)
app.include_router(profile.router)
app.include_router(leaderboard.router)


@app.get("/health")
def health():
    return {"status": "ok"}
