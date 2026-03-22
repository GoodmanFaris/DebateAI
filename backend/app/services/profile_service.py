from fastapi import HTTPException, status
from sqlmodel import Session, select
from app.models.user import User
from app.models.profile import Profile
from app.models.user_stats import UserStats
from app.models.session import Session as GameSession
from app.models.session_score import SessionScore
from app.models.scenario import Scenario
from datetime import datetime
from app.schemas.profile import ProfileResponse, UpdateProfileRequest, SessionHistoryEntry, SessionHistoryResponse


def get_profile(user: User, session: Session) -> ProfileResponse:
    profile = session.exec(
        select(Profile).where(Profile.user_id == user.id)
    ).first()
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    stats = session.exec(
        select(UserStats).where(UserStats.user_id == user.id)
    ).first()
    if stats is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User stats not found",
        )

    return ProfileResponse(
        display_name=profile.display_name,
        username=profile.username,
        avatar_url=profile.avatar_url,
        region=profile.region,
        level=stats.level,
        xp=stats.xp,
        current_streak=stats.current_streak,
        best_streak=stats.best_streak,
        total_sessions=stats.total_sessions,
        total_wins=stats.total_wins,
        average_score=stats.average_score,
        is_premium=user.is_premium,
    )


def update_profile(
    data: UpdateProfileRequest, user: User, session: Session
) -> ProfileResponse:
    profile = session.exec(
        select(Profile).where(Profile.user_id == user.id)
    ).first()
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    updates = data.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    if "username" in updates:
        existing = session.exec(
            select(Profile).where(
                Profile.username == updates["username"],
                Profile.user_id != user.id,
            )
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already taken",
            )

    for field, value in updates.items():
        setattr(profile, field, value)
    profile.updated_at = datetime.utcnow()

    session.commit()
    session.refresh(profile)

    return get_profile(user, session)


def get_history(user: User, session: Session) -> SessionHistoryResponse:
    query = (
        select(
            GameSession.id,
            Scenario.title,
            Scenario.difficulty,
            GameSession.finished_at,
            GameSession.outcome,
            SessionScore.total_score,
        )
        .join(Scenario, Scenario.id == GameSession.scenario_id)
        .outerjoin(SessionScore, SessionScore.session_id == GameSession.id)
        .where(
            GameSession.user_id == user.id,
            GameSession.status == "completed",
        )
        .order_by(GameSession.finished_at.desc())
    )

    rows = session.exec(query).all()

    entries = [
        SessionHistoryEntry(
            session_id=row.id,
            scenario_title=row.title,
            difficulty=row.difficulty,
            completed_at=row.finished_at,
            outcome=row.outcome,
            total_score=row.total_score,
        )
        for row in rows
    ]

    return SessionHistoryResponse(entries=entries)
