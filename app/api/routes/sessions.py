from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.deps import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.schemas.session import (
    StartSessionRequest,
    StartSessionResponse,
    SendMessageRequest,
    SendMessageResponse,
    FinishSessionResponse,
    CoachResponse,
    SessionResultResponse,
    UpdateVisibilityRequest,
    UpdateVisibilityResponse,
    PublicReplayResponse,
    SessionDetailResponse,
)
from app.services import session_service

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("/start", response_model=StartSessionResponse)
def start_session(
    data: StartSessionRequest,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return session_service.start_session(data, user, session)


@router.get("/{session_id}", response_model=SessionDetailResponse)
def get_session_detail(
    session_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return session_service.get_session(session_id, user, session)


@router.post("/{session_id}/message", response_model=SendMessageResponse)
def send_message(
    session_id: int,
    data: SendMessageRequest,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return session_service.send_message(session_id, data, user, session)


@router.post("/{session_id}/finish", response_model=FinishSessionResponse)
def finish_session(
    session_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return session_service.finish_session(session_id, user, session)


@router.get("/{session_id}/result", response_model=SessionResultResponse)
def get_result(
    session_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return session_service.get_result(session_id, user, session)


@router.get("/{session_id}/coach", response_model=CoachResponse)
def get_coach(
    session_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return session_service.get_coach(session_id, user, session)


@router.patch("/{session_id}/visibility", response_model=UpdateVisibilityResponse)
def update_visibility(
    session_id: int,
    data: UpdateVisibilityRequest,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return session_service.update_visibility(session_id, data, user, session)


@router.get("/{session_id}/public-replay", response_model=PublicReplayResponse)
def get_public_replay(
    session_id: int,
    session: Session = Depends(get_session),
):
    return session_service.get_public_replay(session_id, session)
