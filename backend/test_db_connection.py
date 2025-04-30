"""
Script para testar a conexão com o banco de dados
"""
import os
import sys
from urllib.parse import quote_plus
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

print("=== Teste de Conexão com o Banco de Dados ===")
print(f"URL do banco de dados (parcial): {DATABASE_URL.split('@')[0]}****@{DATABASE_URL.split('@')[1]}")

try:
    # Tenta criar a engine de conexão
    print("\n1. Criando engine de conexão...")
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    
    # Tenta estabelecer uma conexão
    print("2. Tentando estabelecer conexão...")
    conn = engine.connect()
    print("✅ Conexão estabelecida com sucesso!")
    
    # Tenta executar uma consulta simples
    print("\n3. Executando consulta para verificar tabelas...")
    result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
    tables = [row[0] for row in result]
    
    print("\nTabelas encontradas no banco de dados:")
    if tables:
        for table in tables:
            print(f"- {table}")
    else:
        print("Nenhuma tabela encontrada no esquema 'public'.")
    
    # Verificar especificamente a tabela users
    print("\n4. Verificando a tabela 'users'...")
    if 'users' in tables:
        print("✅ Tabela 'users' encontrada!")
        
        # Verificar as colunas da tabela users
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"))
        columns = [row[0] for row in result]
        
        print("\nColunas na tabela 'users':")
        for column in columns:
            print(f"- {column}")
            
        # Verificar se há registros na tabela users
        result = conn.execute(text("SELECT COUNT(*) FROM users"))
        count = result.scalar()
        print(f"\nTotal de registros na tabela 'users': {count}")
    else:
        print("❌ Tabela 'users' não encontrada!")
    
    # Fechar conexão
    conn.close()
    
except SQLAlchemyError as e:
    print(f"❌ Erro ao conectar ao banco de dados: {str(e)}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Erro não esperado: {str(e)}")
    sys.exit(1)

print("\n=== Teste concluído ===") 