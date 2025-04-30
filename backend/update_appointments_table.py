from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv
import sys

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# Obtém a URL do banco de dados do ambiente
database_url = os.getenv("DATABASE_URL")

if not database_url:
    print("Erro: DATABASE_URL não encontrada nas variáveis de ambiente.")
    sys.exit(1)

print(f"Conectando ao banco de dados: {database_url}")

# Cria engine de conexão com o banco
engine = create_engine(database_url)

try:
    # Verifica se as colunas já existem antes de tentar adicioná-las
    with engine.connect() as conn:
        # Verifica coluna contact
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'contact'"))
        contact_exists = result.fetchone() is not None
        
        # Verifica coluna notes
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'notes'"))
        notes_exists = result.fetchone() is not None
        
        # Adiciona as colunas que não existem
        if not contact_exists:
            print("Adicionando coluna 'contact' à tabela appointments...")
            conn.execute(text("ALTER TABLE appointments ADD COLUMN contact VARCHAR"))
            print("Coluna 'contact' adicionada com sucesso!")
        else:
            print("A coluna 'contact' já existe na tabela appointments.")
            
        if not notes_exists:
            print("Adicionando coluna 'notes' à tabela appointments...")
            conn.execute(text("ALTER TABLE appointments ADD COLUMN notes VARCHAR"))
            print("Coluna 'notes' adicionada com sucesso!")
        else:
            print("A coluna 'notes' já existe na tabela appointments.")
            
        # Commit das alterações
        conn.commit()
        
    print("Atualização da tabela appointments concluída com sucesso!")
    
except Exception as e:
    print(f"Erro ao atualizar a tabela appointments: {e}")
    sys.exit(1) 