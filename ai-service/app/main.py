from fastapi import FastAPI

from app.api import diary, math_image, goals, report, reward

app = FastAPI(title="Aptiverse AI")


@app.get("/")
def read_root():
    return {"message": "Welcome to Aptiverse AI!"}


app.include_router(diary.router, prefix="/diary", tags=["diary"])
app.include_router(math_image.router, prefix="/math-image", tags=["math"])
app.include_router(goals.router, prefix="/goals", tags=["goals"])
app.include_router(report.router, prefix="/report", tags=["report"])
app.include_router(reward.router, prefix="/reward", tags=["reward"])
