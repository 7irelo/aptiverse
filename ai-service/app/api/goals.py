from fastapi import APIRouter
from app.models.goal_model import evaluate_goals
from app.schemas.goals import GoalInput

router = APIRouter()

@router.post("/")
def evaluate(goal_input: GoalInput):
    return evaluate_goals(goal_input)