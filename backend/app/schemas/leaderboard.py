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
