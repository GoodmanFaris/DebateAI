from datetime import date
from fastapi import HTTPException, status
from sqlmodel import Session, select
from app.models.scenario import Scenario
from app.models.daily_challenge import DailyChallenge
from app.models.user import User
from app.schemas.scenario import ScenarioListItem, ScenarioDetailResponse, DailyChallengeResponse


def get_scenario(scenario_id: int, session: Session) -> ScenarioDetailResponse:
    scenario = session.exec(
        select(Scenario).where(Scenario.id == scenario_id, Scenario.is_active == True)
    ).first()
    if scenario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found",
        )
    return ScenarioDetailResponse.model_validate(scenario)


def get_daily_challenge(user: User, session: Session) -> DailyChallengeResponse:
    today = date.today()
    challenge = session.exec(
        select(DailyChallenge).where(DailyChallenge.challenge_date == today)
    ).first()
    if challenge is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No daily challenge available for today",
        )

    easy = session.get(Scenario, challenge.easy_scenario_id)
    medium = session.get(Scenario, challenge.medium_scenario_id)
    hard = session.get(Scenario, challenge.hard_scenario_id)

    return DailyChallengeResponse(
        id=challenge.id,
        challenge_date=str(today),
        easy=_to_list_item(easy, user),
        medium=_to_list_item(medium, user),
        hard=_to_list_item(hard, user),
    )


def _to_list_item(scenario: Scenario, user: User) -> ScenarioListItem:
    return ScenarioListItem(
        id=scenario.id,
        slug=scenario.slug,
        title=scenario.title,
        short_description=scenario.short_description,
        category=scenario.category,
        difficulty=scenario.difficulty,
        is_premium=scenario.is_premium and not user.is_premium,
        image_url=scenario.image_url,
    )
