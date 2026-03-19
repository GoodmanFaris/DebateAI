from typing import Optional
from sqlmodel import SQLModel


class SessionScoreResponse(SQLModel):
    persuasion_score: float
    clarity_score: float
    confidence_score: float
    logic_score: float
    objection_handling_score: float
    total_score: float
    outcome: str


class SessionFeedbackResponse(SQLModel):
    summary: str
    pros: str
    cons: str
    improvement_tips: str
    coach_analysis: Optional[str]
    tone_analysis: Optional[str]


class SessionResultResponse(SQLModel):
    session_id: int
    score: SessionScoreResponse
    feedback: SessionFeedbackResponse
