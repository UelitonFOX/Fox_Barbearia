from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv
import sys
import traceback

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
    with engine.connect() as conn:
        # Fazer backup dos dados existentes
        print("Verificando se existem dados para backup...")
        result = conn.execute(text("SELECT COUNT(*) FROM appointments"))
        count = result.scalar()
        
        if count > 0:
            print(f"Encontrados {count} agendamentos. Fazendo backup...")
            appointments = conn.execute(text("SELECT * FROM appointments")).fetchall()
            for appt in appointments:
                print(f"  - Backup: {dict(appt._mapping)}")
        else:
            print("Não há dados para backup. Prosseguindo...")
        
        # Remover a tabela atual
        print("\nRemovendo tabela appointments...")
        conn.execute(text("DROP TABLE IF EXISTS appointments CASCADE"))
        conn.commit()
        print("Tabela appointments removida.")
        
        # Criar a tabela novamente com a estrutura correta
        print("\nCriando nova tabela appointments...")
        conn.execute(text("""
            CREATE TABLE appointments (
                id SERIAL PRIMARY KEY,
                client_name VARCHAR NOT NULL,
                user_id INTEGER NOT NULL REFERENCES users(id),
                service_id INTEGER NOT NULL REFERENCES services(id),
                date_time TIMESTAMP NOT NULL,
                status VARCHAR NOT NULL DEFAULT 'scheduled',
                contact VARCHAR,
                notes VARCHAR,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.commit()
        print("Nova tabela appointments criada com sucesso!")
        
        # Restaurar dados do backup (se houver)
        if count > 0:
            print("\nRestaurando dados do backup...")
            for appt in appointments:
                # Mapear campos mantendo a estrutura nova (date_time em vez de scheduled_datetime)
                conn.execute(text("""
                    INSERT INTO appointments 
                    (id, client_name, user_id, service_id, date_time, status, contact, notes) 
                    VALUES (:id, :client_name, :user_id, :service_id, :scheduled_datetime, :status, :contact, :notes)
                """), dict(appt._mapping))
            conn.commit()
            print(f"{count} registros restaurados com sucesso!")
        
        print("\nVerificando nova estrutura...")
        result = conn.execute(text("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'appointments'
            ORDER BY ordinal_position
        """))
        
        columns = result.fetchall()
        print(f"Nova estrutura da tabela appointments ({len(columns)} colunas):")
        for column in columns:
            print(f"  - {column.column_name} ({column.data_type}) {column.is_nullable}")
            
    print("\nOperação concluída com sucesso!")
    
except Exception as e:
    print(f"Erro ao recriar tabela: {e}")
    print(traceback.format_exc())
    sys.exit(1) 