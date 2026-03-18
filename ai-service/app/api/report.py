from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.models.recommender import generate_report

router = APIRouter()


class ReportRequest(BaseModel):
    scores: Optional[dict[str, list[float]]] = None
    diary_emotions: Optional[list[dict]] = None
    goal_progress: Optional[dict] = None


@router.post("/")
def report(request: ReportRequest):
    return generate_report(
        scores=request.scores,
        diary_emotions=request.diary_emotions,
        goal_progress=request.goal_progress,
    )


@router.get("/")
def report_info():
    return {
        "message": "POST a ReportRequest with scores, diary_emotions, and/or goal_progress."
    }
