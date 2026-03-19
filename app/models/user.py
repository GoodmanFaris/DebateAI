from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.profile import Profile
    from app.models.user_stats import UserStats
    from app.models.session import Session


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: Optional[str] = Field(default=None, nullable=True)
    auth_provider: str = Field(default="email")
    google_id: Optional[str] = Field(default=None, nullable=True, unique=True)
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)
    is_premium: bool = Field(default=False)
    premium_until: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login_at: Optional[datetime] = None

    profile: Optional["Profile"] = Relationship(back_populates="user")
    stats: Optional["UserStats"] = Relationship(back_populates="user")
    sessions: List["Session"] = Relationship(back_populates="user")
