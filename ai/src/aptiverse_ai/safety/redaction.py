"""PII redaction before content goes to traces, eval candidates or any third party that does not need it.

Recognisers for South African formats: 13-digit ID numbers (date of birth prefix plus Luhn check digit),
mobile and landline numbers, and email addresses. Presidio can be layered on top for names; these regexes
are the always-on floor because they are cheap and have no model to drift.
"""

from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass, field

_EMAIL = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
_SA_ID = re.compile(r"(?<!\d)(\d{2})(\d{2})(\d{2})\d{7}(?!\d)")
_PHONE = re.compile(r"(?<![\d+])(?:\+27|0027|0)\s?\(?\d{2}\)?[\s-]?\d{3}[\s-]?\d{4}(?!\d)")


def _luhn_ok(number: str) -> bool:
    total = 0
    for i, ch in enumerate(reversed(number)):
        d = int(ch)
        if i % 2 == 1:
            d *= 2
            if d > 9:
                d -= 9
        total += d
    return total % 10 == 0


def _is_sa_id(match: re.Match[str]) -> bool:
    month, day = int(match.group(2)), int(match.group(3))
    return 1 <= month <= 12 and 1 <= day <= 31 and _luhn_ok(match.group(0))


@dataclass(slots=True)
class Redaction:
    text: str
    counts: Counter[str] = field(default_factory=Counter)

    @property
    def changed(self) -> bool:
        return bool(self.counts)


def redact(text: str) -> Redaction:
    counts: Counter[str] = Counter()

    def sub_id(m: re.Match[str]) -> str:
        if _is_sa_id(m):
            counts["sa_id"] += 1
            return "[ID_NUMBER]"
        return m.group(0)

    def sub(label: str, token: str):  # type: ignore[no-untyped-def]
        def inner(_: re.Match[str]) -> str:
            counts[label] += 1
            return token

        return inner

    out = _EMAIL.sub(sub("email", "[EMAIL]"), text)
    out = _SA_ID.sub(sub_id, out)
    out = _PHONE.sub(sub("phone", "[PHONE]"), out)
    return Redaction(out, counts)
