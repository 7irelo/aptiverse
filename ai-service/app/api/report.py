from fastapi import APIRouter
from app.models.recommender import generate_report

router = APIRouter()

@router.get("/")
def report():
    return generate_report()