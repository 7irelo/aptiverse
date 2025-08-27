from pydantic import BaseModel

class GoalInput(BaseModel):
    course: str
    target_score: float
    timeframe_months: int