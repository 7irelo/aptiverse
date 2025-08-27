from pydantic import BaseModel

class ReportRequest(BaseModel):
    student_id: int