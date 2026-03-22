from datetime import datetime, timedelta
from sqlmodel import Session, select
from app.models.user_stats import UserStats

BASE_XP = {"fail": 5, "partial": 10, "success": 20}
DIFFICULTY_MULTIPLIER = {"easy": 1.0, "medium": 2.0, "hard": 3.5}


def calculate_xp(outcome: str, difficulty: str) -> int:
    base = BASE_XP.get(outcome, 5)
    multiplier = DIFFICULTY_MULTIPLIER.get(difficulty, 1.0)
    return round(base * multiplier)


def update_stats(
    user_id: int,
    outcome: str | None,
    total_score: float | None,
    difficulty: str,
    session: Session,
) -> None:
    stats = session.exec(
        select(UserStats).where(UserStats.user_id == user_id)
    ).first()
    if stats is None:
        stats = UserStats(user_id=user_id)
        session.add(stats)

    now = datetime.utcnow()

    stats.total_sessions += 1
    stats.total_completed_sessions += 1

    if outcome == "success":
        stats.total_wins += 1

    if total_score is not None:
        stats.total_score += round(total_score)
        stats.average_score = round(
            stats.total_score / stats.total_completed_sessions, 1
        )

    if outcome:
        xp_earned = calculate_xp(outcome, difficulty)
        stats.xp += xp_earned
        stats.level = stats.xp // 100 + 1

    if stats.last_session_at:
        last_date = stats.last_session_at.date()
        today = now.date()
        if today == last_date + timedelta(days=1):
            stats.current_streak += 1
        elif today > last_date + timedelta(days=1):
            stats.current_streak = 1
    else:
        stats.current_streak = 1

    if stats.current_streak > stats.best_streak:
        stats.best_streak = stats.current_streak

    stats.last_session_at = now
    stats.updated_at = now
