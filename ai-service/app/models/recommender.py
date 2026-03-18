from typing import Optional


def generate_report(
    scores: Optional[dict[str, list[float]]] = None,
    diary_emotions: Optional[list[dict]] = None,
    goal_progress: Optional[dict] = None,
) -> dict:
    """Generate a learner performance report based on available data.

    Args:
        scores: Mapping of subject → list of recent scores (0-100).
        diary_emotions: Recent emotion analysis results from diary entries.
        goal_progress: Current goal tracking data.
    """
    strengths: list[str] = []
    weaknesses: list[str] = []
    recommendations: list[str] = []

    # ── Score analysis ────────────────────────────────────────────────
    subject_averages: dict[str, float] = {}
    overall_avg = 0.0

    if scores:
        for subject, marks in scores.items():
            if not marks:
                continue
            avg = sum(marks) / len(marks)
            subject_averages[subject] = round(avg, 1)
            trend = _compute_trend(marks)

            if avg >= 75:
                strengths.append(f"Performing well in {subject} (avg {avg:.0f}%)")
            elif avg < 50:
                weaknesses.append(f"Struggling in {subject} (avg {avg:.0f}%)")
                recommendations.append(
                    f"Schedule additional practice sessions for {subject}"
                )

            if trend == "declining" and avg < 70:
                recommendations.append(
                    f"Scores in {subject} are declining — review recent topics"
                )
            elif trend == "improving":
                strengths.append(f"Showing improvement in {subject}")

        if subject_averages:
            overall_avg = round(
                sum(subject_averages.values()) / len(subject_averages), 1
            )

    # ── Emotional wellbeing ───────────────────────────────────────────
    wellbeing_flag = None
    if diary_emotions:
        negative_labels = {"sadness", "anger", "fear", "disgust"}
        neg_count = sum(
            1
            for entry in diary_emotions
            if isinstance(entry, dict) and entry.get("label", "").lower() in negative_labels
        )
        neg_ratio = neg_count / len(diary_emotions) if diary_emotions else 0

        if neg_ratio > 0.5:
            wellbeing_flag = "at_risk"
            recommendations.append(
                "High frequency of negative emotions detected — consider reaching out to a counsellor"
            )
        elif neg_ratio > 0.3:
            wellbeing_flag = "monitor"
            recommendations.append(
                "Some emotional distress detected — encourage journaling and breaks"
            )
        else:
            wellbeing_flag = "stable"

    # ── Goal tracking ─────────────────────────────────────────────────
    if goal_progress:
        completion = goal_progress.get("completion_pct", 0)
        if completion >= 80:
            strengths.append("On track to meet learning goals")
        elif completion < 40:
            weaknesses.append("Falling behind on learning goals")
            recommendations.append(
                "Break goals into smaller milestones and review weekly"
            )

    # ── Fallback when no data is provided ─────────────────────────────
    if not scores and not diary_emotions and not goal_progress:
        return {
            "status": "insufficient_data",
            "message": "Provide scores, diary emotions, or goal progress to generate a report.",
        }

    return {
        "overall_average": overall_avg,
        "subject_averages": subject_averages,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "wellbeing": wellbeing_flag,
        "goal_completion_pct": (goal_progress or {}).get("completion_pct"),
    }


def _compute_trend(marks: list[float]) -> str:
    """Simple trend detection over a list of chronological scores."""
    if len(marks) < 3:
        return "stable"
    recent = marks[-3:]
    if recent[-1] > recent[0] + 5:
        return "improving"
    elif recent[-1] < recent[0] - 5:
        return "declining"
    return "stable"
