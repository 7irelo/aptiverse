import pandas as pd

from app.data.universities import get_university_data
from app.schemas.goals import GoalInput


async def evaluate_goals(goal_input: GoalInput) -> dict:
    """Evaluate whether a learner's goal is feasible given university requirements.

    Compares the learner's target score and timeframe against university programme
    entry requirements sourced from the database.
    """
    data = await get_university_data()
    df = pd.DataFrame(data)
    matches = df[df["course"].str.lower() == goal_input.course.lower()]

    if matches.empty:
        return {
            "goal_feasibility": "unknown",
            "reason": f"No programmes found matching '{goal_input.course}'.",
            "matching_programmes": [],
            "recommendations": [
                "Verify the course name or broaden the search.",
                "Contact the institution directly for admission requirements.",
            ],
        }

    results = []
    for _, row in matches.iterrows():
        min_score = row.get("min_score", 0)
        duration = row.get("duration", "unknown")
        gap = goal_input.target_score - min_score

        if gap >= 10:
            feasibility = "highly_feasible"
            advice = "Target score exceeds the minimum comfortably."
        elif gap >= 0:
            feasibility = "feasible"
            advice = "Target score meets the minimum — aim higher for safety."
        elif gap >= -10:
            feasibility = "stretch"
            advice = "Target score is slightly below the minimum — improvement needed."
        else:
            feasibility = "unlikely"
            advice = f"Target score is {abs(gap):.0f} points below the requirement."

        # Rough monthly score improvement needed
        monthly_gain = max(0, -gap) / max(goal_input.timeframe_months, 1)

        results.append(
            {
                "university": row.get("name", "Unknown"),
                "course": row.get("course"),
                "min_score": min_score,
                "duration": duration,
                "feasibility": feasibility,
                "score_gap": round(gap, 1),
                "monthly_improvement_needed": round(monthly_gain, 2),
                "advice": advice,
            }
        )

    # Overall feasibility is the best outcome across matching programmes
    feasibility_rank = {"highly_feasible": 4, "feasible": 3, "stretch": 2, "unlikely": 1}
    best = max(results, key=lambda r: feasibility_rank.get(r["feasibility"], 0))

    recommendations = []
    if best["feasibility"] in ("stretch", "unlikely"):
        recommendations.append(
            "Focus study time on weaker subjects to close the score gap."
        )
        recommendations.append(
            "Consider alternative programmes with lower entry requirements as a backup."
        )
    if goal_input.timeframe_months < 6:
        recommendations.append(
            "Short timeframe — create a weekly study schedule and track progress closely."
        )

    return {
        "goal_feasibility": best["feasibility"],
        "target_score": goal_input.target_score,
        "timeframe_months": goal_input.timeframe_months,
        "matching_programmes": results,
        "recommendations": recommendations,
    }
