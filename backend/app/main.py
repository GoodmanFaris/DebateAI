from fastapi import FastAPI
from app.api.routes import auth, scenarios, sessions, profile, leaderboard, daily_challenge, billing
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="DebateAI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(scenarios.router)
app.include_router(sessions.router)
app.include_router(profile.router)
app.include_router(leaderboard.router)
app.include_router(billing.router)


@app.get("/health")
def health():
    return {"status": "ok"}
