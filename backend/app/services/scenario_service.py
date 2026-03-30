from datetime import datetime
from fastapi import HTTPException, status
from sqlmodel import Session, select
from app.models.scenario import Scenario
from app.models.daily_challenge import DailyChallenge
from app.models.user import User
from app.schemas.scenario import ScenarioListItem, ScenarioDetailResponse, DailyChallengeResponse, ScenarioBulkCreateRequest, ScenarioBulkCreateResponse
from datetime import datetime, UTC
from app.schemas.daily_challenge import DailyChallengeCreateResponse

from app.schemas.daily_challenge import DailyChallengeCreateResponse

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
    today = datetime.utcnow().date()
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


def create_scenarios_bulk(
    payload: ScenarioBulkCreateRequest,
    session: Session,
) -> ScenarioBulkCreateResponse:
    inserted = 0
    skipped = 0

    for item in payload.scenarios:
        existing = session.exec(
            select(Scenario).where(Scenario.slug == item.slug)
        ).first()

        if existing:
            skipped += 1
            continue

        scenario = Scenario(
            slug=item.slug,
            title=item.title,
            short_description=item.short_description,
            full_description=item.full_description,
            category=item.category,
            difficulty=item.difficulty,
            goal=item.goal,
            user_role=item.user_role,
            ai_role=item.ai_role,
            ai_personality=item.ai_personality,
            opening_context=item.opening_context,
            rules=item.rules,
            max_turns=item.max_turns,
            is_premium=item.is_premium,
            is_active=item.is_active,
            system_prompt=item.system_prompt,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        )

        session.add(scenario)
        inserted += 1

    session.commit()

    return ScenarioBulkCreateResponse(
        message="Bulk scenario import completed",
        inserted=inserted,
        skipped=skipped,
    )

def create_daily_challenge_auto(session: Session) -> DailyChallengeCreateResponse:
    today = datetime.now(UTC).date()

    existing_challenge = session.exec(
        select(DailyChallenge).where(DailyChallenge.challenge_date == today)
    ).first()

    if existing_challenge is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Daily challenge for today already exists",
        )

    latest_scenarios = session.exec(
        select(Scenario)
        .where(Scenario.is_active == True)
        .order_by(Scenario.id.desc())
    ).all()

    if len(latest_scenarios) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 3 active scenarios are required",
        )

    latest_three = latest_scenarios[:3]

    easy_scenario = latest_three[2]
    medium_scenario = latest_three[1]
    hard_scenario = latest_three[0]

    daily_challenge = DailyChallenge(
        challenge_date=today,
        easy_scenario_id=easy_scenario.id,
        medium_scenario_id=medium_scenario.id,
        hard_scenario_id=hard_scenario.id,
        created_at=datetime.now(UTC),
    )

    session.add(daily_challenge)
    session.commit()
    session.refresh(daily_challenge)

    return DailyChallengeCreateResponse(
        id=daily_challenge.id,
        challenge_date=daily_challenge.challenge_date,
        easy_scenario_id=daily_challenge.easy_scenario_id,
        medium_scenario_id=daily_challenge.medium_scenario_id,
        hard_scenario_id=daily_challenge.hard_scenario_id,
    )