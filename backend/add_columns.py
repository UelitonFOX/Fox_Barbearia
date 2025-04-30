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

def add_columns():
    """
    Adiciona a coluna specialty à tabela users
    """
    db = SessionLocal()
    
    try:
        # Verificar se a coluna specialty existe
        result_specialty = db.execute(
            text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'specialty'")
        ).fetchone()
        
        # Adicionar coluna specialty se não existir
        if not result_specialty:
            db.execute(text("ALTER TABLE users ADD COLUMN specialty VARCHAR"))
            print("Coluna 'specialty' adicionada à tabela users")
        else:
            print("Coluna 'specialty' já existe na tabela users")
        
        # Commit das alterações
        db.commit()
        print("Operação concluída com sucesso!")
        
    except Exception as e:
        db.rollback()
        print(f"Erro ao adicionar coluna specialty: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    add_columns() 