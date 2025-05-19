from sqlalchemy import Column, Integer, String
from .db import Base

class University(Base):
    __tablename__ = "universities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    course = Column(String, index=True)
    min_score = Column(Integer)
    duration = Column(String)