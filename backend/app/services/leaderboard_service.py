from datetime import datetime, timedelta
from sqlalchemy import func
from sqlmodel import Session, select
from app.models.user import User
from app.models.profile import Profile
from app.models.user_stats import UserStats
from app.models.session import Session as GameSession
from app.models.session_score import SessionScore
from app.models.daily_challenge import DailyChallenge
from app.schemas.leaderboard import LeaderboardEntry, LeaderboardResponse

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
