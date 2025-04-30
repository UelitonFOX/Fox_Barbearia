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

def add_phone_column():
    """
    Verifica se a coluna phone existe na tabela users e adiciona se não existir
    """
    db = SessionLocal()
    
    try:
        # Verificar se a coluna phone existe
        result = db.execute(
            text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone'")
        ).fetchone()
        
        # Se a coluna não existir, adicioná-la
        if not result:
            print("Coluna 'phone' não encontrada. Adicionando à tabela users...")
            db.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR"))
            db.commit()
            print("Coluna 'phone' adicionada com sucesso!")
        else:
            print("Coluna 'phone' já existe na tabela users.")
        
        # Remover a coluna specialty se existir
        result_specialty = db.execute(
            text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'specialty'")
        ).fetchone()
        
        if result_specialty:
            print("Coluna 'specialty' encontrada. Removendo da tabela users...")
            db.execute(text("ALTER TABLE users DROP COLUMN specialty"))
            db.commit()
            print("Coluna 'specialty' removida com sucesso!")
        else:
            print("Coluna 'specialty' não existe na tabela users.")
        
        # Listar todas as colunas para verificação
        columns = db.execute(
            text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'")
        ).fetchall()
        
        print("\nColunas atuais na tabela users:")
        for column in columns:
            print(f"- {column[0]}")
            
    except Exception as e:
        db.rollback()
        print(f"Erro ao modificar colunas: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("=== Correção da estrutura da tabela users ===")
    add_phone_column()
    print("=== Operação concluída ===") 