from fastapi import FastAPI
from app.api.routes import auth, scenarios

app = FastAPI(title="DebateAI")

app.include_router(auth.router)
app.include_router(scenarios.router)


@app.get("/health")
def health():
    return {"status": "ok"}
