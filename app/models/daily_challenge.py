from datetime import date, datetime
from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.session import Session


class DailyChallenge(SQLModel, table=True):
    __tablename__ = "dailychallenge"

    id: Optional[int] = Field(default=None, primary_key=True)
    challenge_date: date = Field(unique=True, index=True)
    easy_scenario_id: int = Field(foreign_key="scenario.id")
    medium_scenario_id: int = Field(foreign_key="scenario.id")
    hard_scenario_id: int = Field(foreign_key="scenario.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    sessions: List["Session"] = Relationship(back_populates="daily_challenge")
