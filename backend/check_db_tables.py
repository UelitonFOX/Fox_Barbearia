from sqlalchemy import create_engine, text, inspect
import os
from dotenv import load_dotenv
import sys
import json

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
inspector = inspect(engine)

try:
    # Listar todas as tabelas no banco de dados
    tables = inspector.get_table_names()
    print(f"\nTabelas encontradas no banco de dados ({len(tables)}):")
    for table in tables:
        print(f"  - {table}")
    
    # Para cada tabela, listar suas colunas
    print("\nDetalhes das tabelas principais:")
    main_tables = ["users", "services", "appointments", "attendances"]
    
    for table in main_tables:
        if table in tables:
            columns = inspector.get_columns(table)
            print(f"\nTabela '{table}' ({len(columns)} colunas):")
            for column in columns:
                nullable = "NULL" if column["nullable"] else "NOT NULL"
                default = f"DEFAULT {column['default']}" if column["default"] is not None else ""
                print(f"  - {column['name']} ({column['type']}) {nullable} {default}")
        else:
            print(f"\nTabela '{table}' não encontrada no banco de dados!")
    
    # Verificar se há registros nas tabelas
    with engine.connect() as conn:
        for table in main_tables:
            if table in tables:
                result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.scalar()
                print(f"\nTabela '{table}' contém {count} registros.")
                
                # Mostrar exemplo de registro se existir
                if count > 0:
                    result = conn.execute(text(f"SELECT * FROM {table} LIMIT 1"))
                    row = result.fetchone()
                    if row:
                        print(f"Exemplo de registro: {dict(row._mapping)}")
    
except Exception as e:
    print(f"Erro ao verificar o banco de dados: {e}")
    print(traceback.format_exc())
    sys.exit(1) 