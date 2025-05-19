from fastapi import APIRouter
from pydantic import BaseModel
from app.models.diary_model import analyze_diary

router = APIRouter()

class DiaryEntry(BaseModel):
    student_id: str
    text: str

@router.post("/")
def analyze_diary_entry(entry: DiaryEntry):
    emotions = analyze_diary(entry.text)
    return {"emotions": emotions}
