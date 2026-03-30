from datetime import date
from sqlmodel import SQLModel
from datetime import date
from typing import Optional
from sqlmodel import SQLModel


class DailyChallengeAutoCreateRequest(SQLModel):
    challenge_date: Optional[date] = None


class DailyChallengeCreateResponse(SQLModel):
    id: int
    challenge_date: date
    easy_scenario_id: int
    medium_scenario_id: int
    hard_scenario_id: int