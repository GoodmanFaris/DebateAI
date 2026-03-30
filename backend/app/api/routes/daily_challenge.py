from fastapi import APIRouter, Depends, Header, HTTPException, status
from app.schemas.scenario import DailyChallengeResponse, ScenarioDetailResponse, ScenarioBulkCreateRequest, ScenarioBulkCreateResponse
from sqlmodel import Session
from app.services import scenario_service
from app.services.session_service import get_session
from app.schemas.daily_challenge import DailyChallengeCreateResponse
from app.core.config import settings

router = APIRouter(tags=["scenarios"])

@router.post("/daily-challenge/auto", response_model=DailyChallengeCreateResponse)
def create_daily_challenge_auto(
    session: Session = Depends(get_session),
    x_api_key: str | None = Header(default=None),
):
    if x_api_key != settings.X_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized",
        )

    return scenario_service.create_daily_challenge_auto(session)