"""
Script para corrigir a estrutura do banco de dados
"""
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

def fix_database_structure():
    """
    Corrige a estrutura do banco de dados:
    1. Adiciona a coluna phone se não existir
    2. Remove a coluna specialty se existir
    """
    print("=== Corrigindo estrutura do banco de dados ===")
    db = SessionLocal()
    
    try:
        # Verificar se a coluna phone existe e criar se não existir
        result_phone = db.execute(
            text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone'")
        ).fetchone()
        
        if not result_phone:
            print("Criando coluna 'phone' na tabela users...")
            db.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR"))
            db.commit()
            print("✅ Coluna 'phone' criada com sucesso!")
        else:
            print("✅ Coluna 'phone' já existe.")
        
        # Verificar se a coluna specialty existe e remover se existir
        result_specialty = db.execute(
            text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'specialty'")
        ).fetchone()
        
        if result_specialty:
            print("Removendo coluna 'specialty' da tabela users...")
            db.execute(text("ALTER TABLE users DROP COLUMN specialty"))
            db.commit()
            print("✅ Coluna 'specialty' removida com sucesso!")
        else:
            print("✅ Coluna 'specialty' não existe (ok).")
        
        # Verificar colunas atuais
        columns = db.execute(
            text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'")
        ).fetchall()
        
        print("\nColunas atuais na tabela users:")
        for column in columns:
            print(f"- {column[0]}")
        
        print("\n✅ Estrutura do banco de dados corrigida com sucesso!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao corrigir estrutura do banco de dados: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_database_structure() 