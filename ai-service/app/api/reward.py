from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class RewardEvent(BaseModel):
    student_id: str
    event_type: str  # e.g. "test_completed", "streak", "goal_reached", "diary_entry"
    metadata: dict = {}


# Points awarded per event type
_POINTS_TABLE: dict[str, int] = {
    "test_completed": 10,
    "test_passed": 25,
    "diary_entry": 5,
    "streak_3_day": 15,
    "streak_7_day": 40,
    "streak_30_day": 100,
    "goal_reached": 50,
    "first_login": 5,
    "profile_completed": 10,
}

# Badge thresholds (cumulative points → badge)
_BADGES = [
    (50, "Bronze Scholar"),
    (150, "Silver Scholar"),
    (400, "Gold Scholar"),
    (1000, "Platinum Scholar"),
]

# In-memory ledger (replaced by a database in production)
_ledger: dict[str, int] = {}


@router.post("/")
def award_reward(event: RewardEvent):
    """Calculate and award points for a student activity event."""
    points = _POINTS_TABLE.get(event.event_type, 0)

    # Bonus multiplier for high-value metadata
    if event.event_type == "test_completed":
        score = event.metadata.get("score", 0)
        if score >= 90:
            points += 15  # excellence bonus
        elif score >= 75:
            points += 5

    current = _ledger.get(event.student_id, 0)
    new_total = current + points
    _ledger[event.student_id] = new_total

    # Determine current badge
    badge = None
    for threshold, name in _BADGES:
        if new_total >= threshold:
            badge = name

    return {
        "student_id": event.student_id,
        "event_type": event.event_type,
        "points_awarded": points,
        "total_points": new_total,
        "badge": badge,
    }


@router.get("/{student_id}")
def get_rewards(student_id: str):
    """Retrieve the current reward balance and badge for a student."""
    total = _ledger.get(student_id, 0)
    badge = None
    for threshold, name in _BADGES:
        if total >= threshold:
            badge = name

    return {
        "student_id": student_id,
        "total_points": total,
        "badge": badge,
    }
