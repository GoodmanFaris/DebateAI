import json
from openai import OpenAI
from app.core.config import settings
from app.models.scenario import Scenario
from app.models.message import Message
from app.ai.evaluation import build_conversation_text

client = OpenAI(api_key=settings.OPENAI_API_KEY, timeout=10.0)

COACH_PROMPT = """You are a premium communication coach doing a deep post-session review.

Scenario context:
- Goal: {goal}
- User role: {user_role}
- AI role: {ai_role}
- AI personality: {ai_personality}

Scoring result:
- Outcome: {outcome}
- Persuasion: {persuasion_score}/100
- Clarity: {clarity_score}/100
- Confidence: {confidence_score}/100
- Logic: {logic_score}/100
- Objection handling: {objection_handling_score}/100
- Total: {total_score}/100

Instructions:
- Focus ONLY on the most important moments — do NOT analyze every message
- Quote or paraphrase short key parts of the user's messages where useful
- Explain what the opposing side was doing strategically
- Be specific and direct — no generic advice
- Reference what the user actually said, not what they could have said in theory

You must respond with ONLY valid JSON in this exact format:
{{
    "overall_analysis": "3-5 sentences: what the user did well, what hurt their position, and how they came across overall",
    "tone_analysis": "2-3 sentences: what tone the user used, how it shifted, and how the other side likely perceived them",
    "opponent_analysis": "2-3 sentences: what strategy the opposing side used and how they exploited or responded to the user's approach",
    "key_moments": [
        {{
            "moment": "brief quote or paraphrase of what happened",
            "impact": "positive or negative",
            "explanation": "1 sentence explaining why this moment mattered"
        }}
    ],
    "better_responses": [
        {{
            "original": "what the user said (short quote or paraphrase)",
            "suggested": "a better alternative response",
            "why": "1 sentence explaining why this would work better"
        }}
    ],
    "winning_move": "1-2 sentences describing one high-impact thing the user could have said or done that would have significantly changed the outcome"
}}

Rules for key_moments:
- Include only 2-4 of the MOST important moments
- Each must reference something specific from the conversation

Rules for better_responses:
- Include only 2-3 of the MOST impactful missed opportunities
- The suggested response must be realistic and specific to this scenario"""


def generate_coach_analysis(
    scenario: Scenario,
    messages: list[Message],
    score_result: dict,
) -> dict:
    system_prompt = COACH_PROMPT.format(
        goal=scenario.goal,
        user_role=scenario.user_role,
        ai_role=scenario.ai_role,
        ai_personality=scenario.ai_personality,
        outcome=score_result["outcome"],
        persuasion_score=score_result["persuasion_score"],
        clarity_score=score_result["clarity_score"],
        confidence_score=score_result["confidence_score"],
        logic_score=score_result["logic_score"],
        objection_handling_score=score_result["objection_handling_score"],
        total_score=score_result.get("total_score", "N/A"),
    )
    conversation = build_conversation_text(messages)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Here is the conversation to analyze:\n\n{conversation}"},
        ],
        max_tokens=1000,
        temperature=0.4,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

    return json.loads(raw)
