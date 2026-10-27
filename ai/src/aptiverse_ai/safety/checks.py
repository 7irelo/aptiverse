"""Output checks and the minors' safety pre-filter."""

from __future__ import annotations

import re
from dataclasses import dataclass

_URL = re.compile(r"https?://[^\s)>\]]+", re.IGNORECASE)

# The keyword floor for self-harm and abuse disclosures. A model classification runs too (tutor graph);
# this catches the clear cases even when the model is unavailable. Kept short and reviewed with the
# safeguarding lead, since every false positive interrupts a real study question.
_DISTRESS = re.compile(
    r"\b((kill|killing|hurt|hurting|cut|cutting|harm|harming) myself|end it all|end my life|want to die|"
    r"wanna die|suicid\w*|self[- ]harm\w*|no reason to live|better off dead|"
    r"someone is (hurting|abusing) me|being abused|(he|she|they) touch(es)? me)\b",
    re.IGNORECASE,
)

SUPPORT_REPLY = (
    "It sounds like you are going through something really hard, and I am glad you said something. "
    "You do not have to deal with this alone. You can talk to someone right now, for free:\n"
    "- South African Depression and Anxiety Group (SADAG) suicide crisis line: 0800 567 567\n"
    "- Childline South Africa: 116\n"
    "- In an emergency, call 10111 or 112 from a cellphone.\n"
    "You can also find more support on the Wellbeing support page. If you want to, tell a teacher, "
    "parent or another adult you trust. I am here for your schoolwork whenever you are ready."
)


@dataclass(frozen=True, slots=True)
class OutputCheck:
    ok: bool
    reason: str | None = None


def mentions_distress(text: str) -> bool:
    return bool(_DISTRESS.search(text))


def check_urls(text: str, allowed: set[str]) -> OutputCheck:
    """A reply may only link to URLs that came from retrieved sources (or our own domain)."""
    for url in _URL.findall(text):
        clean = url.rstrip(".,;:!?'\"")
        if clean in allowed or clean.startswith("https://aptiverse.co.za"):
            continue
        return OutputCheck(False, f"unexpected url {clean[:80]}")
    return OutputCheck(True)
