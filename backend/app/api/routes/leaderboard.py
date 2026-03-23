from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.deps import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.schemas.leaderboard import LeaderboardResponse, UserDailyReplaysResponse
from app.services import leaderboard_service

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("/daily", response_model=LeaderboardResponse)
def daily_leaderboard(session: Session = Depends(get_session)):
    return leaderboard_service.get_daily(session)


@router.get("/weekly", response_model=LeaderboardResponse)
def weekly_leaderboard(session: Session = Depends(get_session)):
    return leaderboard_service.get_weekly(session)


@router.get("/global", response_model=LeaderboardResponse)
def global_leaderboard(session: Session = Depends(get_session)):
    return leaderboard_service.get_global(session)


@router.get("/daily/{username}/replays", response_model=UserDailyReplaysResponse)
def user_daily_replays(
    username: str,
    session: Session = Depends(get_session),
):
    return leaderboard_service.get_user_daily_replays(username, session)


@router.get("/local", response_model=LeaderboardResponse)
def local_leaderboard(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return leaderboard_service.get_local(user, session)
