"""
Script para verificar se a tabela attendances existe no banco de dados
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

print("=== Verificando a tabela attendances ===")
print(f"URL do banco de dados (parcial): {DATABASE_URL.split('@')[0]}****@{DATABASE_URL.split('@')[1]}")

try:
    # Criar engine de conexão
    print("\n1. Criando engine de conexão...")
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    
    # Estabelecer conexão
    print("2. Estabelecendo conexão...")
    conn = engine.connect()
    print("✅ Conexão estabelecida com sucesso!")
    
    # Verificar se a tabela attendances existe
    print("\n3. Verificando se a tabela 'attendances' existe...")
    result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'attendances'"))
    table_exists = result.fetchone() is not None
    
    if table_exists:
        print("✅ Tabela 'attendances' encontrada!")
        
        # Verificar as colunas da tabela attendances
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'attendances'"))
        columns = [row[0] for row in result]
        
        print("\nColunas na tabela 'attendances':")
        for column in columns:
            print(f"- {column}")
            
        # Verificar se há registros na tabela attendances
        result = conn.execute(text("SELECT COUNT(*) FROM attendances"))
        count = result.scalar()
        print(f"\nTotal de registros na tabela 'attendances': {count}")
    else:
        print("❌ Tabela 'attendances' não encontrada!")
        
        # Verificar todas as tabelas existentes
        print("\nTabelas existentes no banco de dados:")
        result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
        tables = [row[0] for row in result]
        for table in tables:
            print(f"- {table}")
            
    # Verificar também a tabela services
    print("\n4. Verificando se a tabela 'services' existe...")
    result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'services'"))
    services_exists = result.fetchone() is not None
    
    if services_exists:
        print("✅ Tabela 'services' encontrada!")
        
        # Verificar as colunas da tabela services
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'services'"))
        columns = [row[0] for row in result]
        
        print("\nColunas na tabela 'services':")
        for column in columns:
            print(f"- {column}")
            
        # Verificar se há registros na tabela services
        result = conn.execute(text("SELECT COUNT(*) FROM services"))
        count = result.scalar()
        print(f"\nTotal de registros na tabela 'services': {count}")
    else:
        print("❌ Tabela 'services' não encontrada!")
    
    # Fechar conexão
    conn.close()
    
except SQLAlchemyError as e:
    print(f"❌ Erro ao conectar ao banco de dados: {str(e)}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Erro não esperado: {str(e)}")
    sys.exit(1)

print("\n=== Verificação concluída ===") 