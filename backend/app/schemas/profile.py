from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel


class ProfileResponse(SQLModel):
    display_name: str
    username: str
    avatar_url: Optional[str]
    region: Optional[str]
    level: int
    xp: int
    current_streak: int
    best_streak: int
    total_sessions: int
    total_wins: int
    average_score: float
    is_premium: bool


class UpdateProfileRequest(SQLModel):
    display_name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    region: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None


class SessionHistoryEntry(SQLModel):
    session_id: int
    scenario_title: str
    difficulty: str
    completed_at: datetime
    outcome: Optional[str]
    total_score: Optional[float]
    is_public_replay: bool


class SessionHistoryResponse(SQLModel):
    entries: list[SessionHistoryEntry]
