from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, model_validator

QuestionType = Literal["mcq", "short", "numeric", "long", "flashcard", "essay"]
Format = Literal["quiz", "exam_paper", "reading", "flashcards", "essay"]
CognitiveLevel = Literal["knowledge", "routine", "complex", "problem_solving"]
Stage = Literal["high_school", "university"]


class Option(BaseModel):
    label: str = Field(pattern=r"^[A-F]$")
    text: str = Field(min_length=1, max_length=600)
    correct: bool


class Question(BaseModel):
    id: str = Field(pattern=r"^[a-z0-9.-]{1,40}$")
    type: QuestionType
    topic: str = Field(min_length=1, max_length=120)
    cognitive_level: CognitiveLevel
    marks: int = Field(ge=1, le=50)
    stem: str = Field(min_length=5, max_length=4000)
    options: list[Option] = Field(default_factory=list, max_length=6)
    answer: str = Field(
        default="", max_length=2000, description="Final answer. For numeric questions, a number or expression."
    )
    memo: str = Field(min_length=1, max_length=6000, description="Marking memo: one line per mark-earning point.")
    explanation: str = Field(default="", max_length=4000)

    @model_validator(mode="after")
    def _shape(self) -> Question:
        if self.type == "mcq" and len(self.options) < 3:
            raise ValueError("a multiple choice question needs at least three options")
        if self.type != "mcq" and self.options:
            raise ValueError("only multiple choice questions have options")
        if self.type == "numeric" and not self.answer:
            raise ValueError("a numeric question needs an answer")
        return self


class Section(BaseModel):
    name: str
    questions: list[Question] = Field(min_length=1, max_length=40)


class SectionPlan(BaseModel):
    name: str
    marks: int = Field(ge=1)
    question_count: int = Field(ge=1, le=40)
    question_types: list[QuestionType]
    cognitive_mix: dict[CognitiveLevel, float]
    topics: list[str]


class GenerationRequest(BaseModel):
    job_id: str = Field(min_length=1, max_length=64)
    stage: Stage
    level: str = Field(description="Grade (for example 'Grade 11') or university year and course level", max_length=80)
    subject: str = Field(max_length=80)
    subject_key: str = Field(max_length=80, description="catalog key, for example life_sciences")
    grade: int | None = Field(default=None, ge=8, le=12)
    curriculum: str = Field(default="caps", max_length=20)
    format: Format
    topics: list[str] = Field(min_length=1, max_length=20)
    assessment_title: str | None = Field(default=None, max_length=200)
    total_marks: int | None = Field(default=None, ge=5, le=300)
    avoid_question_stems: list[str] = Field(default_factory=list, max_length=200)
    difficulty: Literal["easier", "standard", "harder"] = Field(
        default="standard", description="Shifts the cognitive-level mix within the level; never changes the level."
    )


class LevelVerdict(BaseModel):
    question_id: str
    appropriate: bool
    reason: str = Field(max_length=400)


class LevelVerdicts(BaseModel):
    verdicts: list[LevelVerdict]
