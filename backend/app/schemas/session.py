from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel


class StartSessionRequest(SQLModel):
    scenario_id: int
    daily_challenge_id: Optional[int] = None


class StartSessionResponse(SQLModel):
    session_id: int
    scenario_slug: str
    opening_context: str
    max_turns: int


class SendMessageRequest(SQLModel):
    content: str


class SendMessageResponse(SQLModel):
    user_message: "MessageResponse"
    ai_message: "MessageResponse"
    turn_count: int
    is_last_turn: bool


class FinishScoreResponse(SQLModel):
    persuasion_score: float
    clarity_score: float
    confidence_score: float
    logic_score: float
    objection_handling_score: float
    total_score: float
    outcome: str


class FinishFeedbackResponse(SQLModel):
    summary: str
    pros: str
    cons: str
    improvement_tips: str


class FinishSessionResponse(SQLModel):
    id: int
    scenario_id: int
    status: str
    outcome: Optional[str]
    turn_count: int
    max_turns: int
    started_at: datetime
    finished_at: Optional[datetime]
    duration_seconds: Optional[int]
    score: Optional[FinishScoreResponse]
    feedback: Optional[FinishFeedbackResponse]


class SessionResponse(SQLModel):
    id: int
    scenario_id: int
    status: str
    outcome: Optional[str]
    turn_count: int
    max_turns: int
    started_at: datetime
    finished_at: Optional[datetime]
    duration_seconds: Optional[int]


class MessageResponse(SQLModel):
    id: int
    role: str
    content: str
    turn_index: int
    created_at: datetime


class SessionDetailResponse(SQLModel):
    id: int
    scenario_id: int
    status: str
    outcome: Optional[str]
    turn_count: int
    max_turns: int
    started_at: datetime
    finished_at: Optional[datetime]
    duration_seconds: Optional[int]
    messages: list["MessageResponse"]


class SessionResultResponse(SQLModel):
    session_id: int
    scenario_title: str
    difficulty: str
    outcome: Optional[str]
    total_score: Optional[float]
    summary: Optional[str]
    pros: Optional[str]
    cons: Optional[str]
    improvement_tips: Optional[str]
    coach_analysis: Optional[str] = None
    tone_analysis: Optional[str] = None


class KeyMoment(SQLModel):
    moment: str
    impact: str
    explanation: str


class BetterResponse(SQLModel):
    original: str
    suggested: str
    why: str


class CoachResponse(SQLModel):
    overall_analysis: str
    tone_analysis: str
    opponent_analysis: str
    key_moments: list[KeyMoment]
    better_responses: list[BetterResponse]
    winning_move: str


class UpdateVisibilityRequest(SQLModel):
    is_public_replay: bool


class UpdateVisibilityResponse(SQLModel):
    session_id: int
    is_public_replay: bool


class ReplayMessageResponse(SQLModel):
    role: str
    content: str
    turn_index: int
    created_at: datetime


class PublicReplayResponse(SQLModel):
    session_id: int
    username: str
    display_name: str
    avatar_url: Optional[str]
    scenario_title: str
    difficulty: str
    outcome: Optional[str]
    total_score: Optional[float]
    messages: list[ReplayMessageResponse]


SendMessageResponse.model_rebuild()
FinishSessionResponse.model_rebuild()
SessionDetailResponse.model_rebuild()
CoachResponse.model_rebuild()
PublicReplayResponse.model_rebuild()
