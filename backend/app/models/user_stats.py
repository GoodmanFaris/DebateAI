from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.user import User


class UserStats(SQLModel, table=True):
    __tablename__ = "userstats"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True, index=True)
    level: int = Field(default=1)
    xp: int = Field(default=0)
    current_streak: int = Field(default=0)
    best_streak: int = Field(default=0)
    total_sessions: int = Field(default=0)
    total_completed_sessions: int = Field(default=0)
    total_wins: int = Field(default=0)
    total_score: int = Field(default=0)
    average_score: float = Field(default=0.0)
    last_session_at: Optional[datetime] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user: Optional["User"] = Relationship(back_populates="stats")
