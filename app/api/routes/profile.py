from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.deps import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.schemas.profile import ProfileResponse, UpdateProfileRequest, SessionHistoryResponse
from app.services import profile_service

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=ProfileResponse)
def get_profile(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return profile_service.get_profile(user, session)


@router.patch("", response_model=ProfileResponse)
def update_profile(
    data: UpdateProfileRequest,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return profile_service.update_profile(data, user, session)


@router.get("/history", response_model=SessionHistoryResponse)
def get_history(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return profile_service.get_history(user, session)
