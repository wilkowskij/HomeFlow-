import anthropic
import os
import json
from app.utils.logger import logger

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
MODEL = "claude-sonnet-4-20250514"


async def call_claude(prompt: str, system: str = "", max_tokens: int = 1024) -> str:
    """Single call to Claude, returns text content."""
    try:
        messages = [{"role": "user", "content": prompt}]
        kwargs = {"model": MODEL, "max_tokens": max_tokens, "messages": messages}
        if system:
            kwargs["system"] = system
        response = client.messages.create(**kwargs)
        return response.content[0].text
    except Exception as e:
        logger.error(f"Claude API error: {e}")
        raise


async def call_claude_json(prompt: str, system: str = "", max_tokens: int = 1024) -> dict:
    """Call Claude and parse response as JSON."""
    system_with_json = (system + "\n\nRespond ONLY with valid JSON. No markdown, no preamble.").strip()
    text = await call_claude(prompt, system_with_json, max_tokens)
    try:
        clean = text.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        return json.loads(clean)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}. Raw: {text[:200]}")
        raise ValueError(f"Failed to parse JSON from Claude: {e}")
