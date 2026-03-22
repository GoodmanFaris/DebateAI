from openai import OpenAI
from app.core.config import settings
from app.models.scenario import Scenario
from app.models.message import Message

MAX_HISTORY_MESSAGES = 20

client = OpenAI(api_key=settings.OPENAI_API_KEY, timeout=10.0)


def build_system_prompt(scenario: Scenario) -> str:
    GLOBAL_RULES = """
        You are part of a communication training simulation.

        Act like a real human, not an AI assistant.

        If the user says something unclear, irrelevant, or nonsensical:
        - react naturally
        - express confusion or push back
        - do not default to polite corporate responses

        If the user behaves unprofessionally, gives nonsense answers, or avoids the question:
        - react like a real person in your role
        - do not stay polite by default
        - show confusion, concern, or disapproval if appropriate
        - you may become more direct or serious
        - you may question the user’s professionalism

        If the behavior continues:
        - reduce patience
        - be more firm and brief
        - you can escalate the situation (e.g., suggest a follow-up meeting, question their attitude)

        Do not always respond with full sentences.
        Sometimes respond very briefly (e.g., "?", "What?", "I'm not following you.")

        You are allowed to:
        - question the user directly
        - show mild frustration or skepticism
        - redirect the conversation

        Do not always respond in full, polished sentences.

        You can:
        - respond briefly
        - use short reactions like "?", "What?", "Seriously?"
        - interrupt or redirect quickly

        Your tone should vary:
        - sometimes calm
        - sometimes direct
        - sometimes slightly frustrated

        Do not sound like HR or corporate communication.
        Sound like a real person in a real conversation.

        When the user is disrespectful:
        - respond firmly, not politely
        - do not soften your response
        - keep it short and direct

        Avoid:
        - overly polite phrases like "I appreciate your input"
        - sounding like a formal email
        - generic assistant-style responses

        Your responses should feel like real spoken conversation.
        Keep them short (1–3 sentences).
        """

    return (
        f"{scenario.system_prompt}\n\n"
        f"You are playing the role of: {scenario.ai_role}\n"
        f"Your personality: {scenario.ai_personality}\n"
        f"Scenario goal: {scenario.goal}\n"
        f"Context: {scenario.opening_context}\n\n"
        f"{GLOBAL_RULES}\n\n"
        "Rules:\n"
        "- Stay in character at all times\n"
        "- Never help the user win the argument\n"
        "- Never break character or acknowledge you are an AI\n"
        "- Challenge weak arguments\n"
        "- Keep responses short and realistic (1-3 sentences)\n"
        "- Respond naturally as your character would"
    )

def build_message_history(
    system_prompt: str, messages: list[Message]
) -> list[dict]:
    chat_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        chat_messages.append({"role": msg.role, "content": msg.content})
    return chat_messages


def generate_reply(scenario: Scenario, messages: list[Message]) -> str:
    system_prompt = build_system_prompt(scenario)
    recent_messages = messages[-MAX_HISTORY_MESSAGES:]
    chat_messages = build_message_history(system_prompt, recent_messages)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=chat_messages,
        max_tokens=150,
        temperature=0.83,
    )

    return response.choices[0].message.content
