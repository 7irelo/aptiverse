import pandas as pd
from app.data.universities import get_university_data

async def evaluate_goals(goal_input):
    data = await get_university_data()
    df = pd.DataFrame(data)
    match = df[df["course"] == goal_input.course]
    return {
        "goal_feasibility": "Under Evaluation",
        "requirements": match.to_dict(orient="records")
    }
