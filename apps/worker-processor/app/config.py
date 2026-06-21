# apps/worker-processor/app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    RABBITMQ_URL: str
    S3_ENDPOINT: str
    # Esto validará que las variables existan al iniciar el worker
    class Config:
        env_file = ".env"

settings = Settings()