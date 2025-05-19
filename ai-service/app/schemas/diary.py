from pydantic import BaseModel

class DiaryRequest(BaseModel):
    text: str

class DiaryResponse(BaseModel):
    emotions: list