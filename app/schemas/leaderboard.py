from typing import List
from sqlmodel import SQLModel


class LeaderboardEntryResponse(SQLModel):
    rank: int
    username: str
    avatar_url: str | None
    level: int
    total_wins: int
    average_score: float


class LeaderboardResponse(SQLModel):
    entries: List[LeaderboardEntryResponse]
    total: int
