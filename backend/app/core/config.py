import os
from pathlib import Path # Importar Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Determinar o caminho base do projeto (assumindo que config.py está em backend/app/core)
# backend/app/core -> backend/app -> backend -> raiz_do_projeto
project_dir = Path(__file__).resolve().parent.parent.parent.parent

# Construir o caminho para o arquivo .env na pasta backend
dotenv_path = project_dir / "backend" / ".env"

# Carregar o arquivo .env explicitamente
print(f"[DEBUG config.py] Tentando carregar .env de: {dotenv_path}")
if dotenv_path.is_file():
    load_dotenv(dotenv_path=dotenv_path)
    print("[DEBUG config.py] Arquivo .env encontrado e carregado.")
else:
    print("[DEBUG config.py] Arquivo .env NÃO encontrado no caminho esperado.")
    # Considerar carregar variáveis de ambiente do sistema se .env não for encontrado?
    # load_dotenv() # Tentativa padrão (pode não funcionar como esperado)

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
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"]

settings = Settings()

# --- DEBUG --- #
print(f"[DEBUG config.py] DATABASE_URL carregada: {settings.DATABASE_URL}")
# --- FIM DEBUG --- # 