from typing import Optional
from sqlmodel import SQLModel


class LeaderboardEntry(SQLModel):
    rank: int
    username: str
    display_name: str
    avatar_url: Optional[str]
    score: float


class LeaderboardResponse(SQLModel):
    entries: list[LeaderboardEntry]


class DailySlot(SQLModel):
    difficulty: str
    scenario_title: str
    session_id: Optional[int] = None
    total_score: Optional[float] = None
    outcome: Optional[str] = None
    is_public_replay: bool = False
    completed: bool = False


class UserDailyReplaysResponse(SQLModel):
    username: str
    display_name: str
    avatar_url: Optional[str]
    slots: list[DailySlot]
