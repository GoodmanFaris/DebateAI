from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.deps import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.schemas.scenario import ScenarioDetailResponse, DailyChallengeResponse, ScenarioBulkCreateRequest, ScenarioBulkCreateResponse
from fastapi import Header, HTTPException, status
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


@router.post("/scenarios/bulk", response_model=ScenarioBulkCreateResponse)
def create_scenarios_bulk(
    payload: ScenarioBulkCreateRequest,
    session: Session = Depends(get_session),
    x_api_key: str | None = Header(default=None),
):
    if x_api_key != "TVOJ_SUPER_TAJNI_KLJUC":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized",
        )

    return scenario_service.create_scenarios_bulk(payload, session)