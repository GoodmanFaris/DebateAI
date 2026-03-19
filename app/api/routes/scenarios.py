from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.deps import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.schemas.scenario import ScenarioDetailResponse, DailyChallengeResponse
from app.services import scenario_service

router = APIRouter(tags=["scenarios"])


@router.get("/daily", response_model=DailyChallengeResponse)
def get_daily_challenge(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return scenario_service.get_daily_challenge(user, session)


@router.get("/scenarios/{scenario_id}", response_model=ScenarioDetailResponse)
def get_scenario(
    scenario_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return scenario_service.get_scenario(scenario_id, session)
