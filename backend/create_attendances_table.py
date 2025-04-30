"""
Script para criar a tabela attendances no banco de dados se ela não existir
"""
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Obter a URL do banco de dados
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ Erro: a variável DATABASE_URL não está definida no arquivo .env")
    sys.exit(1)

print("=== Criando tabela attendances ===")
print(f"URL do banco de dados (parcial): {DATABASE_URL.split('@')[0]}****@{DATABASE_URL.split('@')[1]}")

try:
    # Criar engine de conexão
    print("\n1. Criando engine de conexão...")
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    
    # Estabelecer conexão
    print("2. Estabelecendo conexão...")
    conn = engine.connect()
    print("✅ Conexão estabelecida com sucesso!")
    
    # Verificar se a tabela attendances já existe
    print("\n3. Verificando se a tabela 'attendances' já existe...")
    result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'attendances'"))
    table_exists = result.fetchone() is not None
    
    if table_exists:
        print("✅ Tabela 'attendances' já existe. Nenhuma ação necessária.")
    else:
        print("❌ Tabela 'attendances' não encontrada. Criando tabela...")
        
        # Iniciar uma transação
        trans = conn.begin()
        
        try:
            # Criar a tabela attendances
            create_table_sql = """
            CREATE TABLE attendances (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                service_id INTEGER NOT NULL REFERENCES services(id),
                original_value FLOAT NOT NULL,
                discount_amount FLOAT DEFAULT 0.0,
                final_value FLOAT NOT NULL,
                payment_method VARCHAR NOT NULL,
                date_time TIMESTAMP DEFAULT NOW()
            );
            """
            
            conn.execute(text(create_table_sql))
            trans.commit()
            print("✅ Tabela 'attendances' criada com sucesso!")
            
        except Exception as e:
            trans.rollback()
            print(f"❌ Erro ao criar tabela 'attendances': {str(e)}")
            
            # Verificar se a tabela services existe
            print("\nVerificando se a tabela 'services' existe...")
            result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'services'"))
            services_exists = result.fetchone() is not None
            
            if not services_exists:
                print("❌ Tabela 'services' não existe! Você precisa criar essa tabela primeiro.")
                
                # Verificar todas as tabelas existentes
                print("\nTabelas existentes no banco de dados:")
                result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
                tables = [row[0] for row in result]
                for table in tables:
                    print(f"- {table}")
    
    # Fechar conexão
    conn.close()
    
except SQLAlchemyError as e:
    print(f"❌ Erro ao conectar ao banco de dados: {str(e)}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Erro não esperado: {str(e)}")
    sys.exit(1)

print("\n=== Operação concluída ===") 