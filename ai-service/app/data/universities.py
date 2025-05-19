from sqlalchemy.future import select
from .db import SessionLocal
from .models import University

async def get_university_data():
    async with SessionLocal() as session:
        result = await session.execute(select(University))
        universities = result.scalars().all()
        return [u.__dict__ for u in universities]