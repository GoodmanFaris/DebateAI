from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.scenario import Scenario
    from app.models.daily_challenge import DailyChallenge
    from app.models.message import Message
    from app.models.session_score import SessionScore
    from app.models.session_feedback import SessionFeedback


class Session(SQLModel, table=True):
    __tablename__ = "session"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    scenario_id: int = Field(foreign_key="scenario.id", index=True)
    daily_challenge_id: Optional[int] = Field(default=None, foreign_key="dailychallenge.id", nullable=True)
    status: str = Field(default="active")
    outcome: Optional[str] = None
    turn_count: int = Field(default=0)
    max_turns: int
    started_at: datetime = Field(default_factory=datetime.utcnow)
    finished_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    last_activity_at: datetime = Field(default_factory=datetime.utcnow)
    is_public_replay: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user: Optional["User"] = Relationship(back_populates="sessions")
    scenario: Optional["Scenario"] = Relationship(back_populates="sessions")
    daily_challenge: Optional["DailyChallenge"] = Relationship(back_populates="sessions")
    messages: List["Message"] = Relationship(back_populates="session")
    score: Optional["SessionScore"] = Relationship(back_populates="session")
    feedback: Optional["SessionFeedback"] = Relationship(back_populates="session")
