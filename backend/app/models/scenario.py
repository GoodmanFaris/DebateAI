from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.session import Session


class Scenario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    slug: str = Field(unique=True, index=True)
    title: str
    short_description: str
    full_description: str
    category: str
    difficulty: str
    goal: str
    user_role: str
    ai_role: str
    ai_personality: str
    opening_context: str
    rules: Optional[str] = None
    max_turns: int
    is_premium: bool = Field(default=False)
    is_active: bool = Field(default=True)
    image_url: Optional[str] = None
    system_prompt: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    sessions: List["Session"] = Relationship(back_populates="scenario")
