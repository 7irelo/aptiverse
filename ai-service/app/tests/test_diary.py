from app.models.diary_model import analyze_diary

def test_emotion():
    result = analyze_diary("I feel so overwhelmed")
    assert isinstance(result, list)