from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from urllib.parse import quote_plus

from app.core.config import settings

# URL do banco de dados com tratamento para caracteres especiais
database_url = settings.DATABASE_URL

# Criação da engine de conexão com o banco de dados
engine = create_engine(database_url, pool_pre_ping=True)

# Sessão para interagir com o banco de dados
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os modelos
Base = declarative_base()

# Função para obter a sessão do banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 