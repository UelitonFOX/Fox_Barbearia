from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configuração da conexão com o banco de dados
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/fox_barbearia")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_columns():
    """
    Verifica se as colunas phone e specialty existem na tabela users
    """
    db = SessionLocal()
    
    try:
        # Verificar as colunas da tabela users
        result = db.execute(
            text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'")
        ).fetchall()
        
        print("Colunas na tabela users:")
        for row in result:
            print(f"- {row[0]}")
        
    except Exception as e:
        print(f"Erro ao verificar colunas: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_columns() 