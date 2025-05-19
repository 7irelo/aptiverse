from fastapi import APIRouter, UploadFile, File
from app.models.math_model import analyze_math_work

router = APIRouter()

@router.post("/")
def analyze_math(file: UploadFile = File(...)):
    result = analyze_math_work(file)
    return result