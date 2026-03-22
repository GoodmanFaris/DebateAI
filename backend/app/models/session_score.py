from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.session import Session


class SessionScore(SQLModel, table=True):
    __tablename__ = "sessionscore"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="session.id", unique=True, index=True)
    persuasion_score: float
    clarity_score: float
    confidence_score: float
    logic_score: float
    objection_handling_score: float
    total_score: float
    outcome: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    session: Optional["Session"] = Relationship(back_populates="score")
