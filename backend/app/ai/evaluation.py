import json
from openai import OpenAI
from app.core.config import settings
from app.models.scenario import Scenario
from app.models.message import Message

client = OpenAI(api_key=settings.OPENAI_API_KEY, timeout=10.0)

EVALUATION_PROMPT = """You are an expert communication coach evaluating a training session.

Scenario context:
- Goal: {goal}
- User role: {user_role}
- AI role: {ai_role}

Evaluate the user's performance in this conversation.

You must respond with ONLY valid JSON in this exact format:
{{
    "outcome": "fail" or "partial" or "success",
    "persuasion_score": 0-100,
    "clarity_score": 0-100,
    "confidence_score": 0-100,
    "logic_score": 0-100,
    "objection_handling_score": 0-100,
    "summary": "1-2 sentence summary of performance",
    "pros": "key strengths (1-2 sentences)",
    "cons": "key weaknesses (1-2 sentences)",
    "improvement_tips": "actionable advice (1-2 sentences)"
}}

Scoring guide:
- 0-30: Poor performance
- 31-60: Average performance
- 61-80: Good performance
- 81-100: Excellent performance

Outcome guide:
- "fail": user did not achieve the goal at all
- "partial": user made progress but did not fully achieve the goal
- "success": user achieved the goal convincingly"""


def build_conversation_text(messages: list[Message]) -> str:
    lines = []
    for msg in messages:
        label = "User" if msg.role == "user" else "AI"
        lines.append(f"{label}: {msg.content}")
    return "\n".join(lines)


def evaluate_session(scenario: Scenario, messages: list[Message]) -> dict:
    system_prompt = EVALUATION_PROMPT.format(
        goal=scenario.goal,
        user_role=scenario.user_role,
        ai_role=scenario.ai_role,
    )
    conversation = build_conversation_text(messages)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Here is the conversation to evaluate:\n\n{conversation}"},
        ],
        max_tokens=500,
        temperature=0.3,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

    return json.loads(raw)
