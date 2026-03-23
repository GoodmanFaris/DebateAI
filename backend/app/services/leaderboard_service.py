from datetime import datetime, timedelta
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlmodel import Session, select
from app.models.user import User
from app.models.profile import Profile
from app.models.user_stats import UserStats
from app.models.session import Session as GameSession
from app.models.session_score import SessionScore
from app.models.daily_challenge import DailyChallenge
from app.models.scenario import Scenario
from app.schemas.leaderboard import (
    LeaderboardEntry,
    LeaderboardResponse,
    DailySlot,
    UserDailyReplaysResponse,
)

LEADERBOARD_LIMIT = 50


def _build_entries(rows: list) -> list[LeaderboardEntry]:
    entries = []
    for rank, row in enumerate(rows, start=1):
        entries.append(
            LeaderboardEntry(
                rank=rank,
                username=row.username,
                display_name=row.display_name,
                avatar_url=row.avatar_url,
                score=row.score,
            )
        )
    return entries


def get_daily(session: Session) -> LeaderboardResponse:
    today = datetime.utcnow().date()

    challenge = session.exec(
        select(DailyChallenge).where(DailyChallenge.challenge_date == today)
    ).first()
    if challenge is None:
        return LeaderboardResponse(entries=[])

    query = (
        select(
            Profile.username,
            Profile.display_name,
            Profile.avatar_url,
            func.max(SessionScore.total_score).label("score"),
        )
        .join(GameSession, GameSession.id == SessionScore.session_id)
        .join(Profile, Profile.user_id == GameSession.user_id)
        .where(
            GameSession.daily_challenge_id == challenge.id,
            GameSession.status == "completed",
        )
        .group_by(Profile.user_id, Profile.username, Profile.display_name, Profile.avatar_url)
        .order_by(func.max(SessionScore.total_score).desc())
        .limit(LEADERBOARD_LIMIT)
    )

    rows = session.exec(query).all()
    return LeaderboardResponse(entries=_build_entries(rows))


def get_weekly(session: Session) -> LeaderboardResponse:
    cutoff = datetime.utcnow() - timedelta(days=7)

    query = (
        select(
            Profile.username,
            Profile.display_name,
            Profile.avatar_url,
            func.sum(SessionScore.total_score).label("score"),
        )
        .join(GameSession, GameSession.id == SessionScore.session_id)
        .join(Profile, Profile.user_id == GameSession.user_id)
        .where(
            GameSession.status == "completed",
            GameSession.finished_at >= cutoff,
        )
        .group_by(Profile.user_id, Profile.username, Profile.display_name, Profile.avatar_url)
        .order_by(func.sum(SessionScore.total_score).desc())
        .limit(LEADERBOARD_LIMIT)
    )

    rows = session.exec(query).all()
    return LeaderboardResponse(entries=_build_entries(rows))


def get_global(session: Session) -> LeaderboardResponse:
    query = (
        select(
            Profile.username,
            Profile.display_name,
            Profile.avatar_url,
            UserStats.total_score.label("score"),
        )
        .join(UserStats, UserStats.user_id == Profile.user_id)
        .where(UserStats.total_score > 0)
        .order_by(UserStats.total_score.desc())
        .limit(LEADERBOARD_LIMIT)
    )

    rows = session.exec(query).all()
    return LeaderboardResponse(entries=_build_entries(rows))


def _build_slot(
    difficulty: str,
    scenario: Scenario,
    rows: list,
) -> DailySlot:
    best = None
    for row in rows:
        if row.scenario_id != scenario.id:
            continue
        if best is None or (row.total_score or 0) > (best.total_score or 0):
            best = row

    if best is None:
        return DailySlot(
            difficulty=difficulty,
            scenario_title=scenario.title,
        )

    return DailySlot(
        difficulty=difficulty,
        scenario_title=scenario.title,
        session_id=best.id,
        total_score=best.total_score,
        outcome=best.outcome,
        is_public_replay=best.is_public_replay,
        completed=True,
    )


def get_user_daily_replays(
    username: str, session: Session
) -> UserDailyReplaysResponse:
    profile = session.exec(
        select(Profile).where(Profile.username == username)
    ).first()
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    today = datetime.utcnow().date()
    challenge = session.exec(
        select(DailyChallenge).where(DailyChallenge.challenge_date == today)
    ).first()
    if challenge is None:
        return UserDailyReplaysResponse(
            username=profile.username,
            display_name=profile.display_name,
            avatar_url=profile.avatar_url,
            slots=[],
        )

    easy_scenario = session.get(Scenario, challenge.easy_scenario_id)
    medium_scenario = session.get(Scenario, challenge.medium_scenario_id)
    hard_scenario = session.get(Scenario, challenge.hard_scenario_id)

    query = (
        select(
            GameSession.id,
            GameSession.scenario_id,
            GameSession.outcome,
            GameSession.is_public_replay,
            SessionScore.total_score,
        )
        .outerjoin(SessionScore, SessionScore.session_id == GameSession.id)
        .where(
            GameSession.user_id == profile.user_id,
            GameSession.daily_challenge_id == challenge.id,
            GameSession.status == "completed",
        )
    )

    rows = session.exec(query).all()

    slots = [
        _build_slot("easy", easy_scenario, rows),
        _build_slot("medium", medium_scenario, rows),
        _build_slot("hard", hard_scenario, rows),
    ]

    return UserDailyReplaysResponse(
        username=profile.username,
        display_name=profile.display_name,
        avatar_url=profile.avatar_url,
        slots=slots,
    )


def get_local(user: User, session: Session) -> LeaderboardResponse:
    user_profile = session.exec(
        select(Profile).where(Profile.user_id == user.id)
    ).first()
    if user_profile is None or user_profile.region is None:
        return LeaderboardResponse(entries=[])

    query = (
        select(
            Profile.username,
            Profile.display_name,
            Profile.avatar_url,
            UserStats.total_score.label("score"),
        )
        .join(UserStats, UserStats.user_id == Profile.user_id)
        .where(
            Profile.region == user_profile.region,
            UserStats.total_score > 0,
        )
        .order_by(UserStats.total_score.desc())
        .limit(LEADERBOARD_LIMIT)
    )

    rows = session.exec(query).all()
    return LeaderboardResponse(entries=_build_entries(rows))
