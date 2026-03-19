from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.session import Session


class SessionFeedback(SQLModel, table=True):
    __tablename__ = "sessionfeedback"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="session.id", unique=True, index=True)
    summary: str
    pros: str
    cons: str
    coach_analysis: Optional[str] = None
    tone_analysis: Optional[str] = None
    improvement_tips: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    session: Optional["Session"] = Relationship(back_populates="feedback")
