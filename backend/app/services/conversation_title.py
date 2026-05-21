import re

from app.config import Settings
from app.llm.chat_client import chat_complete


def _clean_title(raw: str) -> str:
    line = raw.strip().split("\n")[0].strip()
    line = line.strip('"\'').strip()
    line = re.sub(r"^(title:\s*)", "", line, flags=re.IGNORECASE)
    if len(line) > 200:
        line = line[:200].rstrip()
    return line or "New chat"


async def generate_conversation_title(
    http,
    settings: Settings,
    *,
    model: str,
    user_message: str,
    assistant_message: str,
) -> str:
    """Short LLM call to name a chat from the first exchange."""
    prompt = (
        "Create a short chat title (3–8 words) summarizing this conversation.\n"
        "Reply with ONLY the title text. No quotes, colons, or explanation.\n\n"
        f"User: {user_message[:600]}\n"
        f"Assistant: {assistant_message[:600]}"
    )
    raw, _ = await chat_complete(
        http,
        settings,
        model=model,
        messages=[
            {"role": "system", "content": "You write concise, descriptive chat titles."},
            {"role": "user", "content": prompt},
        ],
    )
    return _clean_title(raw)
