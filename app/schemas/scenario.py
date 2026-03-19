from typing import Optional
from sqlmodel import SQLModel


class ScenarioListItem(SQLModel):
    id: int
    slug: str
    title: str
    short_description: str
    category: str
    difficulty: str
    is_premium: bool
    image_url: Optional[str]


class ScenarioDetailResponse(SQLModel):
    id: int
    slug: str
    title: str
    short_description: str
    full_description: str
    category: str
    difficulty: str
    goal: str
    user_role: str
    ai_role: str
    opening_context: str
    rules: Optional[str]
    max_turns: int
    is_premium: bool
    image_url: Optional[str]


class DailyChallengeResponse(SQLModel):
    id: int
    challenge_date: str
    easy: ScenarioListItem
    medium: ScenarioListItem
    hard: ScenarioListItem
