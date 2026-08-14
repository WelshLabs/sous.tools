import re

"""
Open WebUI Secret Sanitizer Pipe / Filter Module
Automatically redacts sensitive API keys, JWT tokens, private credentials,
and passwords from user prompt payloads and LLM logging pipelines.
"""

SECRET_PATTERNS = [
    # Generic API Keys & Tokens
    (r"sk-[a-zA-Z0-9]{20,}", "[REDACTED_OPENAI_KEY]"),
    (r"ghp_[a-zA-Z0-9]{36}", "[REDACTED_GITHUB_TOKEN]"),
    (r"gho_[a-zA-Z0-9]{36}", "[REDACTED_GITHUB_OAUTH]"),
    (r"inf_[a-zA-Z0-9_-]+", "[REDACTED_INFISICAL_TOKEN]"),
    (r"eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]+", "[REDACTED_JWT_TOKEN]"),
    # Passwords and secret values in key-value strings
    (r'(?i)(password|secret|key|token|auth)\s*[:=]\s*["\']?([^"\'\s]+)["\']?', r'\1: [REDACTED_SECRET]'),
]

def sanitize_text(text: str) -> str:
    """Sanitizes text by replacing sensitive secrets with redacted placeholders."""
    if not text or not isinstance(text, str):
        return text
    
    sanitized = text
    for pattern, replacement in SECRET_PATTERNS:
        sanitized = re.sub(pattern, replacement, sanitized)
    
    return sanitized

class Pipe:
    """Open WebUI Pipe Filter implementation."""
    def __init__(self):
        self.type = "filter"
        self.name = "Secret Sanitizer"

    def inlet(self, body: dict) -> dict:
        """Filter incoming prompt messages before passing to LLM."""
        messages = body.get("messages", [])
        for msg in messages:
            if "content" in msg and isinstance(msg["content"], str):
                msg["content"] = sanitize_text(msg["content"])
        return body

    def outlet(self, body: dict) -> dict:
        """Filter outgoing LLM response content if needed."""
        messages = body.get("messages", [])
        for msg in messages:
            if "content" in msg and isinstance(msg["content"], str):
                msg["content"] = sanitize_text(msg["content"])
        return body
