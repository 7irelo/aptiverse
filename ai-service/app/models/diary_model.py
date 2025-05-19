from transformers import pipeline # type: ignore[reportPrivateImportUsage]

# Load sentiment/emotion/trauma model (can be fine-tuned)
emotion_analyzer = pipeline("sentiment-analysis", model="bhadresh-savani/distilbert-base-uncased-emotion")  # type: ignore

def analyze_diary(text: str):
    emotions = emotion_analyzer(text)
    return emotions
