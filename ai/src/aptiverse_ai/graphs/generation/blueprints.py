"""Deterministic test blueprints: marks, question counts and cognitive-level mix come from a table, not a
prompt. The CAPS weightings below follow the cognitive level percentages in the CAPS assessment guidance
(knowledge, routine procedures, complex procedures, problem solving); they are versioned with the code."""

from __future__ import annotations

from aptiverse_ai.graphs.generation.schemas import CognitiveLevel, Format, GenerationRequest, QuestionType, SectionPlan

_MIX: dict[str, dict[CognitiveLevel, float]] = {
    "mathematics": {"knowledge": 0.20, "routine": 0.35, "complex": 0.30, "problem_solving": 0.15},
    "physical_sciences": {"knowledge": 0.15, "routine": 0.40, "complex": 0.35, "problem_solving": 0.10},
    "default": {"knowledge": 0.30, "routine": 0.40, "complex": 0.20, "problem_solving": 0.10},
    "university": {"knowledge": 0.15, "routine": 0.35, "complex": 0.30, "problem_solving": 0.20},
}

_FORMAT: dict[Format, tuple[int, list[tuple[str, float, list[QuestionType]]]]] = {
    # format: (default total marks, [(section, share of marks, question types)])
    "quiz": (20, [("Quiz", 1.0, ["mcq", "short", "numeric"])]),
    "exam_paper": (
        100,
        [
            ("Section A: short questions", 0.3, ["mcq", "short"]),
            ("Section B: structured questions", 0.7, ["short", "numeric", "long"]),
        ],
    ),
    "reading": (20, [("Comprehension", 1.0, ["short", "long"])]),
    "flashcards": (15, [("Flashcards", 1.0, ["flashcard"])]),
    "essay": (50, [("Essay", 1.0, ["essay"])]),
}

_NUMERIC_SUBJECTS = {"mathematics", "mathematical_literacy", "physical_sciences", "accounting"}
_AVG_MARKS: dict[QuestionType, int] = {"mcq": 2, "short": 3, "numeric": 4, "long": 8, "flashcard": 1, "essay": 50}


def plan(request: GenerationRequest) -> list[SectionPlan]:
    total, sections = _FORMAT[request.format]
    total = request.total_marks or total
    mix = _MIX["university"] if request.stage == "university" else _MIX.get(request.subject_key, _MIX["default"])
    plans: list[SectionPlan] = []
    for i, (name, share, types) in enumerate(sections):
        marks = round(total * share) if i < len(sections) - 1 else total - sum(p.marks for p in plans)
        allowed: list[QuestionType] = [t for t in types if t != "numeric" or request.subject_key in _NUMERIC_SUBJECTS]
        avg = sum(_AVG_MARKS[t] for t in allowed) / len(allowed)
        count = max(1, min(40, round(marks / avg)))
        # Spread topics across sections so a multi-topic test is not front-loaded with the first topic.
        topics = request.topics[i :: len(sections)] or request.topics
        plans.append(
            SectionPlan(
                name=name, marks=marks, question_count=count, question_types=allowed, cognitive_mix=mix, topics=topics
            )
        )
    return plans
