from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.session import Session


class Message(SQLModel, table=True):
    __tablename__ = "message"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="session.id", index=True)
    role: str
    content: str
    turn_index: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

    session: Optional["Session"] = Relationship(back_populates="messages")
