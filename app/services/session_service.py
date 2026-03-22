import json
import logging
from datetime import datetime, timedelta
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

MAX_MESSAGE_LENGTH = 1000
FALLBACK_REPLY = "I need a moment to collect my thoughts. Can you repeat that?"
from sqlmodel import Session, select
from app.models.scenario import Scenario
from app.models.session import Session as GameSession
from app.models.message import Message
from app.models.user import User
from app.schemas.session import (
    StartSessionRequest,
    StartSessionResponse,
    SendMessageRequest,
    SendMessageResponse,
    SessionResponse,
    SessionDetailResponse,
    FinishSessionResponse,
    FinishScoreResponse,
    FinishFeedbackResponse,
    CoachResponse,
    SessionResultResponse,
    UpdateVisibilityRequest,
    UpdateVisibilityResponse,
    PublicReplayResponse,
    ReplayMessageResponse,
    MessageResponse,
)
from app.models.session_score import SessionScore
from app.models.session_feedback import SessionFeedback
from app.models.profile import Profile
from app.ai.roleplay import generate_reply
from app.ai.evaluation import evaluate_session
from app.ai.coach import generate_coach_analysis
from app.services.stats_service import update_stats


def start_session(
    data: StartSessionRequest, user: User, session: Session
) -> StartSessionResponse:
    scenario = session.exec(
        select(Scenario).where(Scenario.id == data.scenario_id, Scenario.is_active == True)
    ).first()
    if scenario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found",
        )

    if scenario.is_premium and not user.is_premium:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Premium subscription required for this scenario",
        )

    now = datetime.utcnow()
    game_session = GameSession(
        user_id=user.id,
        scenario_id=scenario.id,
        daily_challenge_id=data.daily_challenge_id,
        status="active",
        outcome=None,
        turn_count=0,
        max_turns=scenario.max_turns,
        started_at=now,
        last_activity_at=now,
    )
    session.add(game_session)
    session.commit()
    session.refresh(game_session)

    return StartSessionResponse(
        session_id=game_session.id,
        scenario_slug=scenario.slug,
        opening_context=scenario.opening_context,
        max_turns=game_session.max_turns,
    )


def get_session(session_id: int, user: User, session: Session) -> SessionDetailResponse:
    game_session = session.get(GameSession, session_id)
    if game_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    if game_session.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    messages = session.exec(
        select(Message)
        .where(Message.session_id == session_id)
        .order_by(Message.turn_index, Message.created_at)
    ).all()

    return SessionDetailResponse(
        id=game_session.id,
        scenario_id=game_session.scenario_id,
        status=game_session.status,
        outcome=game_session.outcome,
        turn_count=game_session.turn_count,
        max_turns=game_session.max_turns,
        started_at=game_session.started_at,
        finished_at=game_session.finished_at,
        duration_seconds=game_session.duration_seconds,
        messages=[MessageResponse.model_validate(m) for m in messages],
    )


def send_message(
    session_id: int,
    data: SendMessageRequest,
    user: User,
    session: Session,
) -> SendMessageResponse:
    game_session = session.get(GameSession, session_id)
    if game_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    if game_session.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    content = data.content.strip()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty",
        )
    if len(content) > MAX_MESSAGE_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Message exceeds maximum length of {MAX_MESSAGE_LENGTH} characters",
        )

    if game_session.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is not active",
        )
    if game_session.turn_count >= game_session.max_turns:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum turns reached",
        )

    now = datetime.utcnow()
    if now - game_session.last_activity_at > timedelta(minutes=10):
        game_session.status = "abandoned"
        game_session.finished_at = game_session.last_activity_at
        if game_session.started_at:
            game_session.duration_seconds = int(
                (game_session.last_activity_at - game_session.started_at).total_seconds()
            )
        session.commit()
        raise HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="Session expired due to inactivity",
        )

    game_session.last_activity_at = now
    game_session.turn_count += 1
    turn_index = game_session.turn_count

    user_message = Message(
        session_id=session_id,
        role="user",
        content=content,
        turn_index=turn_index,
    )
    session.add(user_message)
    session.flush()

    scenario = session.get(Scenario, game_session.scenario_id)

    messages = session.exec(
        select(Message)
        .where(Message.session_id == session_id)
        .order_by(Message.turn_index, Message.created_at)
    ).all()

    try:
        ai_content = generate_reply(scenario, list(messages))
    except Exception:
        logger.exception("AI reply generation failed for session %s", session_id)
        ai_content = FALLBACK_REPLY

    ai_message = Message(
        session_id=session_id,
        role="assistant",
        content=ai_content,
        turn_index=turn_index,
    )
    session.add(ai_message)

    session.commit()
    session.refresh(user_message)
    session.refresh(ai_message)
    session.refresh(game_session)

    return SendMessageResponse(
        user_message=MessageResponse.model_validate(user_message),
        ai_message=MessageResponse.model_validate(ai_message),
        turn_count=game_session.turn_count,
        is_last_turn=game_session.turn_count >= game_session.max_turns,
    )


def finish_session(
    session_id: int, user: User, session: Session
) -> FinishSessionResponse:
    game_session = session.get(GameSession, session_id)
    if game_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    if game_session.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    if game_session.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is not active",
        )

    now = datetime.utcnow()
    game_session.status = "completed"
    game_session.finished_at = now
    if game_session.started_at:
        game_session.duration_seconds = int(
            (now - game_session.started_at).total_seconds()
        )

    scenario = session.get(Scenario, game_session.scenario_id)
    messages = session.exec(
        select(Message)
        .where(Message.session_id == session_id)
        .order_by(Message.turn_index, Message.created_at)
    ).all()

    score_response = None
    feedback_response = None
    session_total_score = None
    message_list = list(messages)

    try:
        result = evaluate_session(scenario, message_list)

        total_score = (
            result["persuasion_score"]
            + result["clarity_score"]
            + result["confidence_score"]
            + result["logic_score"]
            + result["objection_handling_score"]
        ) / 5.0

        game_session.outcome = result["outcome"]

        session_total_score = round(total_score, 1)

        score = SessionScore(
            session_id=session_id,
            persuasion_score=result["persuasion_score"],
            clarity_score=result["clarity_score"],
            confidence_score=result["confidence_score"],
            logic_score=result["logic_score"],
            objection_handling_score=result["objection_handling_score"],
            total_score=session_total_score,
            outcome=result["outcome"],
        )
        session.add(score)

        feedback = SessionFeedback(
            session_id=session_id,
            summary=result["summary"],
            pros=result["pros"],
            cons=result["cons"],
            improvement_tips=result["improvement_tips"],
        )
        session.add(feedback)

        score_response = FinishScoreResponse(
            persuasion_score=score.persuasion_score,
            clarity_score=score.clarity_score,
            confidence_score=score.confidence_score,
            logic_score=score.logic_score,
            objection_handling_score=score.objection_handling_score,
            total_score=score.total_score,
            outcome=score.outcome,
        )
        feedback_response = FinishFeedbackResponse(
            summary=feedback.summary,
            pros=feedback.pros,
            cons=feedback.cons,
            improvement_tips=feedback.improvement_tips,
        )
    except Exception:
        game_session.outcome = None

    update_stats(
        user_id=user.id,
        outcome=game_session.outcome,
        total_score=session_total_score,
        difficulty=scenario.difficulty,
        session=session,
    )

    session.commit()
    session.refresh(game_session)

    return FinishSessionResponse(
        id=game_session.id,
        scenario_id=game_session.scenario_id,
        status=game_session.status,
        outcome=game_session.outcome,
        turn_count=game_session.turn_count,
        max_turns=game_session.max_turns,
        started_at=game_session.started_at,
        finished_at=game_session.finished_at,
        duration_seconds=game_session.duration_seconds,
        score=score_response,
        feedback=feedback_response,
    )


def get_coach(
    session_id: int, user: User, session: Session
) -> CoachResponse:
    if not user.is_premium:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Premium subscription required for coach analysis",
        )

    game_session = session.get(GameSession, session_id)
    if game_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    if game_session.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    if game_session.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is not completed",
        )

    feedback = session.exec(
        select(SessionFeedback).where(SessionFeedback.session_id == session_id)
    ).first()
    if feedback is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session feedback not found",
        )

    if feedback.coach_data:
        return CoachResponse.model_validate(json.loads(feedback.coach_data))

    scenario = session.get(Scenario, game_session.scenario_id)
    messages = session.exec(
        select(Message)
        .where(Message.session_id == session_id)
        .order_by(Message.turn_index, Message.created_at)
    ).all()

    score = session.exec(
        select(SessionScore).where(SessionScore.session_id == session_id)
    ).first()
    if score is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session score not found",
        )

    score_result = {
        "outcome": score.outcome,
        "persuasion_score": score.persuasion_score,
        "clarity_score": score.clarity_score,
        "confidence_score": score.confidence_score,
        "logic_score": score.logic_score,
        "objection_handling_score": score.objection_handling_score,
        "total_score": score.total_score,
    }

    try:
        coach_result = generate_coach_analysis(scenario, list(messages), score_result)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Coach analysis generation failed",
        )

    feedback.coach_data = json.dumps(coach_result)
    session.commit()

    return CoachResponse.model_validate(coach_result)


def get_result(
    session_id: int, user: User, session: Session
) -> SessionResultResponse:
    game_session = session.get(GameSession, session_id)
    if game_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    if game_session.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    if game_session.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is not completed",
        )

    scenario = session.get(Scenario, game_session.scenario_id)

    score = session.exec(
        select(SessionScore).where(SessionScore.session_id == session_id)
    ).first()

    feedback = session.exec(
        select(SessionFeedback).where(SessionFeedback.session_id == session_id)
    ).first()

    coach_analysis = None
    tone_analysis = None
    if feedback and feedback.coach_data:
        coach = json.loads(feedback.coach_data)
        coach_analysis = coach.get("overall_analysis")
        tone_analysis = coach.get("tone_analysis")

    return SessionResultResponse(
        session_id=game_session.id,
        scenario_title=scenario.title,
        difficulty=scenario.difficulty,
        outcome=game_session.outcome,
        total_score=score.total_score if score else None,
        summary=feedback.summary if feedback else None,
        pros=feedback.pros if feedback else None,
        cons=feedback.cons if feedback else None,
        improvement_tips=feedback.improvement_tips if feedback else None,
        coach_analysis=coach_analysis,
        tone_analysis=tone_analysis,
    )


def update_visibility(
    session_id: int,
    data: UpdateVisibilityRequest,
    user: User,
    session: Session,
) -> UpdateVisibilityResponse:
    game_session = session.get(GameSession, session_id)
    if game_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    if game_session.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    if game_session.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is not completed",
        )

    game_session.is_public_replay = data.is_public_replay
    session.commit()
    session.refresh(game_session)

    return UpdateVisibilityResponse(
        session_id=game_session.id,
        is_public_replay=game_session.is_public_replay,
    )


def get_public_replay(
    session_id: int, session: Session
) -> PublicReplayResponse:
    game_session = session.get(GameSession, session_id)
    if game_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    if not game_session.is_public_replay:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Replay not available",
        )

    profile = session.exec(
        select(Profile).where(Profile.user_id == game_session.user_id)
    ).first()

    scenario = session.get(Scenario, game_session.scenario_id)

    score = session.exec(
        select(SessionScore).where(SessionScore.session_id == session_id)
    ).first()

    messages = session.exec(
        select(Message)
        .where(Message.session_id == session_id)
        .order_by(Message.turn_index, Message.created_at)
    ).all()

    return PublicReplayResponse(
        session_id=game_session.id,
        username=profile.username if profile else "unknown",
        display_name=profile.display_name if profile else "Unknown",
        scenario_title=scenario.title,
        difficulty=scenario.difficulty,
        outcome=game_session.outcome,
        total_score=score.total_score if score else None,
        messages=[
            ReplayMessageResponse(
                role=m.role,
                content=m.content,
                turn_index=m.turn_index,
                created_at=m.created_at,
            )
            for m in messages
        ],
    )
