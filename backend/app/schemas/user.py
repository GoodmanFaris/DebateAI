from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel


class ProfileResponse(SQLModel):
    display_name: str
    username: str
    avatar_url: Optional[str]
    region: Optional[str]
    timezone: str
    language: str
    has_completed_tutorial: bool


class UserStatsResponse(SQLModel):
    level: int
    xp: int
    current_streak: int
    best_streak: int
    total_sessions: int
    total_completed_sessions: int
    total_wins: int
    average_score: float
    last_session_at: Optional[datetime]


class UserSummaryResponse(SQLModel):
    id: int
    email: str
    is_premium: bool
    profile: ProfileResponse
    stats: UserStatsResponse
