import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Fox Barbearia API"
    API_V1_STR: str = "/api/v1"
    
    # Configurações do JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fox_barbearia_secret_key_dev")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 dias
    
    # Configurações do Banco de Dados (Supabase/PostgreSQL)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/fox_barbearia"
    )
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:5173"]

settings = Settings() 