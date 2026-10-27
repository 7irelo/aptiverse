"""Chunking by document structure, not fixed size.

CAPS documents split at topic and sub-topic headings, exam papers at each question with its marks, and
anything longer than the budget splits at paragraph boundaries with a small overlap. Every chunk keeps its
heading path so a search hit can say where it came from.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

_MATH = {
    "²": "^{2}",
    "³": "^{3}",
    "×": r"\times ",
    "÷": r"\div ",
    "√": r"\sqrt ",
    "π": r"\pi ",
    "≤": r"\leq ",
    "≥": r"\geq ",
    "≠": r"\neq ",
    "±": r"\pm ",
    "°": r"^{\circ}",
    "θ": r"\theta ",
    "Δ": r"\Delta ",
    "∞": r"\infty ",
}
_WS = re.compile(r"[ \t]+")
_HEADING_NUMBERED = re.compile(r"^(\d+(?:\.\d+){0,3})\.?\s+([A-Z][^\n]{2,120})$")
_HEADING_KEYWORD = re.compile(r"^(TOPIC|SECTION|STRAND|CONTENT AREA|TERM)\b[:\s]*(.{0,120})$", re.IGNORECASE)
_QUESTION = re.compile(r"^QUESTION\s+(\d+)\b.*$", re.IGNORECASE)
_SUBQUESTION = re.compile(r"^(\d+\.\d+(?:\.\d+)?)\s+(.*)$")
_MARKS = re.compile(r"\((\d{1,2})\)\s*$")
_FIGURE = re.compile(r"\b(diagram|figure|graph|sketch|table)\b", re.IGNORECASE)


@dataclass(slots=True)
class Chunk:
    text: str
    heading_path: list[str]
    ordinal: int = 0
    page: int | None = None
    marks: int | None = None
    has_figure: bool = False
    metadata: dict[str, str] = field(default_factory=dict)

    @property
    def token_estimate(self) -> int:
        return estimate_tokens(self.text)


def estimate_tokens(text: str) -> int:
    # Roughly four characters per token for English prose; only used for budgets, never for billing.
    return max(1, len(text) // 4)


def normalise(text: str) -> str:
    """Whitespace cleanup plus common Unicode maths to LaTeX, matching the web app's ASCII-math bridge."""
    for symbol, latex in _MATH.items():
        text = text.replace(symbol, latex)
    lines = [_WS.sub(" ", line).strip() for line in text.replace("\r\n", "\n").split("\n")]
    out: list[str] = []
    for line in lines:
        if line or (out and out[-1]):
            out.append(line)
    return "\n".join(out).strip()


def split_long(text: str, max_tokens: int, overlap_tokens: int = 40) -> list[str]:
    if estimate_tokens(text) <= max_tokens:
        return [text]
    paragraphs = [p for p in re.split(r"\n\s*\n|\n(?=[-*\d]+[.)]?\s)", text) if p.strip()]
    pieces: list[str] = []
    current: list[str] = []
    size = 0
    for para in paragraphs:
        tokens = estimate_tokens(para)
        if current and size + tokens > max_tokens:
            pieces.append("\n\n".join(current))
            tail = current[-1]
            current = [tail] if estimate_tokens(tail) <= overlap_tokens else []
            size = sum(estimate_tokens(c) for c in current)
        if tokens > max_tokens:
            # A single huge paragraph: cut on sentence boundaries.
            sentences = re.split(r"(?<=[.!?])\s+", para)
            buf = ""
            for s in sentences:
                if buf and estimate_tokens(buf + " " + s) > max_tokens:
                    pieces.append(buf)
                    buf = s
                else:
                    buf = f"{buf} {s}".strip()
            if buf:
                current.append(buf)
                size += estimate_tokens(buf)
            continue
        current.append(para)
        size += tokens
    if current:
        pieces.append("\n\n".join(current))
    return pieces


def _is_heading(line: str) -> tuple[int, str] | None:
    if m := _HEADING_KEYWORD.match(line):
        return 1, line.strip()
    if m := _HEADING_NUMBERED.match(line):
        depth = m.group(1).count(".") + 1
        return depth, line.strip()
    if 3 <= len(line) <= 80 and line.isupper() and any(c.isalpha() for c in line):
        return 1, line.strip()
    return None


def chunk_structured(pages: list[str], *, max_tokens: int = 450, title: str | None = None) -> list[Chunk]:
    """CAPS documents and textbooks: a new chunk at every heading, the heading path carried along."""
    path: list[tuple[int, str]] = []
    chunks: list[Chunk] = []
    body: list[str] = []
    body_page: int | None = None

    def flush() -> None:
        nonlocal body, body_page
        text = "\n".join(body).strip()
        if text:
            headings = ([title] if title else []) + [h for _, h in path]
            for piece in split_long(text, max_tokens):
                chunks.append(Chunk(piece, headings, page=body_page, has_figure=bool(_FIGURE.search(piece))))
        body = []
        body_page = None

    for page_no, page in enumerate(pages, start=1):
        for line in normalise(page).split("\n"):
            heading = _is_heading(line)
            if heading:
                flush()
                depth, text = heading
                path = [(d, h) for d, h in path if d < depth] + [(depth, text)]
                continue
            if body_page is None:
                body_page = page_no
            body.append(line)
    flush()
    for i, c in enumerate(chunks):
        c.ordinal = i
    return chunks


def chunk_exam_paper(pages: list[str], *, title: str | None = None, max_tokens: int = 500) -> list[Chunk]:
    """Exam papers and memos: one chunk per sub-question (or per question when there are none), with marks."""
    chunks: list[Chunk] = []
    question: str | None = None
    sub: str | None = None
    body: list[str] = []
    body_page: int | None = None

    def flush() -> None:
        nonlocal body, body_page
        text = "\n".join(body).strip()
        if text and question:
            heading = ([title] if title else []) + [f"QUESTION {question}"] + ([sub] if sub else [])
            marks = _MARKS.search(text)
            for piece in split_long(text, max_tokens):
                chunks.append(
                    Chunk(
                        piece,
                        heading,
                        page=body_page,
                        marks=int(marks.group(1)) if marks else None,
                        has_figure=bool(_FIGURE.search(piece)),
                        metadata={"question": question, **({"sub_question": sub} if sub else {})},
                    )
                )
        body = []
        body_page = None

    for page_no, page in enumerate(pages, start=1):
        for line in normalise(page).split("\n"):
            if m := _QUESTION.match(line):
                flush()
                question, sub = m.group(1), None
                continue
            if question and (m := _SUBQUESTION.match(line)) and m.group(1).split(".")[0] == question:
                flush()
                sub = m.group(1)
                line = m.group(2)
            if body_page is None:
                body_page = page_no
            body.append(line)
    flush()
    for i, c in enumerate(chunks):
        c.ordinal = i
    return chunks
