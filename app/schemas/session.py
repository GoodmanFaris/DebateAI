from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel


class StartSessionRequest(SQLModel):
    scenario_id: int
    daily_challenge_id: Optional[int] = None


class StartSessionResponse(SQLModel):
    session_id: int
    scenario_slug: str
    opening_context: str
    max_turns: int


class SendMessageRequest(SQLModel):
    content: str


class SendMessageResponse(SQLModel):
    user_message: "MessageResponse"
    ai_message: "MessageResponse"
    turn_count: int
    is_last_turn: bool


class SessionResponse(SQLModel):
    id: int
    scenario_id: int
    status: str
    outcome: Optional[str]
    turn_count: int
    max_turns: int
    started_at: datetime
    finished_at: Optional[datetime]
    duration_seconds: Optional[int]


class MessageResponse(SQLModel):
    id: int
    role: str
    content: str
    turn_index: int
    created_at: datetime


SendMessageResponse.model_rebuild()
