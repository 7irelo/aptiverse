import os

class Settings:
    PROJECT_NAME: str = "Aptiverse AI"
    DATA_PATH: str = os.getenv("DATA_PATH", "app/data")
    ENV: str = os.getenv("ENV", "development")

settings = Settings()