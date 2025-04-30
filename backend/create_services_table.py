"""
Script para criar a tabela services no banco de dados se ela não existir
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

print("=== Criando tabela services ===")
print(f"URL do banco de dados (parcial): {DATABASE_URL.split('@')[0]}****@{DATABASE_URL.split('@')[1]}")

try:
    # Criar engine de conexão
    print("\n1. Criando engine de conexão...")
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    
    # Estabelecer conexão
    print("2. Estabelecendo conexão...")
    conn = engine.connect()
    print("✅ Conexão estabelecida com sucesso!")
    
    # Verificar se a tabela services já existe
    print("\n3. Verificando se a tabela 'services' já existe...")
    result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'services'"))
    table_exists = result.fetchone() is not None
    
    if table_exists:
        print("✅ Tabela 'services' já existe. Nenhuma ação necessária.")
    else:
        print("❌ Tabela 'services' não encontrada. Criando tabela...")
        
        # Iniciar uma transação
        trans = conn.begin()
        
        try:
            # Criar a tabela services
            create_table_sql = """
            CREATE TABLE services (
                id SERIAL PRIMARY KEY,
                name VARCHAR NOT NULL UNIQUE,
                description VARCHAR,
                price FLOAT NOT NULL,
                package_price FLOAT,
                package_quantity INTEGER,
                package_days INTEGER,
                duration_minutes INTEGER DEFAULT 30,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP
            );
            """
            
            conn.execute(text(create_table_sql))
            trans.commit()
            print("✅ Tabela 'services' criada com sucesso!")
            
            # Inserir serviços padrão
            print("\n4. Inserindo serviços padrão...")
            insert_trans = conn.begin()
            
            try:
                # Serviços padrão
                default_services = [
                    {
                        "name": "Cabelo",
                        "price": 35.00,
                        "package_price": 50.00,
                        "package_quantity": 2,
                        "package_days": 15,
                        "duration_minutes": 30
                    },
                    {
                        "name": "Barba",
                        "price": 35.00,
                        "package_price": 50.00,
                        "package_quantity": 2,
                        "package_days": 15,
                        "duration_minutes": 30
                    },
                    {
                        "name": "Cabelo + Barba",
                        "price": 60.00,
                        "package_price": 100.00,
                        "package_quantity": 2,
                        "package_days": 15,
                        "duration_minutes": 45
                    },
                    {
                        "name": "Sobrancelha",
                        "price": 20.00,
                        "package_price": 30.00,
                        "package_quantity": 2,
                        "package_days": 15,
                        "duration_minutes": 15
                    },
                    {
                        "name": "Completo",
                        "description": "Cabelo + Barba + Sobrancelha",
                        "price": 70.00,
                        "package_price": 120.00,
                        "package_quantity": 2,
                        "package_days": 15,
                        "duration_minutes": 60
                    }
                ]
                
                for service in default_services:
                    description = service.get("description", "")
                    insert_sql = text("""
                    INSERT INTO services 
                    (name, description, price, package_price, package_quantity, package_days, duration_minutes, is_active) 
                    VALUES (:name, :description, :price, :package_price, :package_quantity, :package_days, :duration_minutes, TRUE)
                    """)
                    
                    conn.execute(insert_sql, {
                        "name": service["name"],
                        "description": description,
                        "price": service["price"],
                        "package_price": service["package_price"],
                        "package_quantity": service["package_quantity"],
                        "package_days": service["package_days"],
                        "duration_minutes": service["duration_minutes"]
                    })
                
                insert_trans.commit()
                print("✅ Serviços padrão inseridos com sucesso!")
                
            except Exception as e:
                insert_trans.rollback()
                print(f"❌ Erro ao inserir serviços padrão: {str(e)}")
            
        except Exception as e:
            trans.rollback()
            print(f"❌ Erro ao criar tabela 'services': {str(e)}")
    
    # Fechar conexão
    conn.close()
    
except SQLAlchemyError as e:
    print(f"❌ Erro ao conectar ao banco de dados: {str(e)}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Erro não esperado: {str(e)}")
    sys.exit(1)

print("\n=== Operação concluída ===") 