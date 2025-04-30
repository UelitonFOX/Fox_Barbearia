import requests
import json
import traceback
from sqlalchemy import create_engine, text, inspect
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

BASE_URL = "http://localhost:8000"  # URL da API
credentials = {
    "username": "uel.rod@gmail.com",
    "password": "@Dev.Fox@11989"
}

def get_token():
    try:
        response = requests.post(f"{BASE_URL}/api/v1/auth/login", data=credentials)
        if response.status_code == 200:
            return response.json().get('access_token')
        print(f"Erro ao obter token: {response.status_code} - {response.text}")
        return None
    except Exception as e:
        print(f"Exceção ao obter token: {e}")
        return None

def check_appointment_schema():
    print("\n=== VERIFICANDO SCHEMA DO APPOINTMENT NO BANCO DE DADOS ===")
    engine = create_engine(database_url)
    inspector = inspect(engine)
    
    try:
        # Verificar a tabela appointments
        if 'appointments' in inspector.get_table_names():
            columns = inspector.get_columns('appointments')
            print(f"Colunas na tabela appointments ({len(columns)}):")
            for column in columns:
                print(f"  - {column['name']} ({column['type']}) {'NULL' if column['nullable'] else 'NOT NULL'}")
            
            # Verificar campos relevantes
            has_scheduled_datetime = any(c['name'] == 'scheduled_datetime' for c in columns)
            has_date_time = any(c['name'] == 'date_time' for c in columns)
            
            print(f"\nTem coluna scheduled_datetime? {has_scheduled_datetime}")
            print(f"Tem coluna date_time? {has_date_time}")
            
        else:
            print("Tabela appointments não encontrada no banco de dados!")
    except Exception as e:
        print(f"Erro ao verificar schema: {e}")

def execute_direct_sql():
    print("\n=== EXECUTANDO SQL DIRETAMENTE NA TABELA ===")
    engine = create_engine(database_url)
    
    try:
        with engine.connect() as conn:
            # Contar registros
            result = conn.execute(text("SELECT COUNT(*) FROM appointments"))
            count = result.scalar()
            print(f"Número de registros em appointments: {count}")
            
            # Tentar inserir um registro de teste
            try:
                conn.execute(text("""
                    INSERT INTO appointments 
                    (client_name, user_id, service_id, scheduled_datetime, status) 
                    VALUES ('Cliente Teste SQL', 4, 1, '2025-05-02 10:00:00', 'scheduled')
                """))
                conn.commit()
                print("✅ Registro de teste inserido com sucesso via SQL direto!")
                
                # Buscar o registro inserido
                result = conn.execute(text("SELECT * FROM appointments WHERE client_name = 'Cliente Teste SQL'"))
                row = result.fetchone()
                if row:
                    print(f"Registro inserido: {dict(row._mapping)}")
            except Exception as e:
                print(f"❌ Erro ao inserir registro de teste: {e}")
    except Exception as e:
        print(f"Erro ao executar SQL: {e}")

def check_api_endpoints():
    print("\n=== TESTANDO ENDPOINTS DA API ===")
    token = get_token()
    if not token:
        print("❌ Não foi possível obter token para testar os endpoints")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Testar GET /appointments
    try:
        print("\nTestando GET /api/v1/appointments/")
        response = requests.get(f"{BASE_URL}/api/v1/appointments/", headers=headers)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Resposta recebida: {json.dumps(data, indent=2)}")
        else:
            print(f"Resposta de erro: {response.text}")
            
            # Se for erro 500, tentar capturar mais detalhes
            if response.status_code == 500:
                print("Analisando erro 500 (Internal Server Error)...")
                try:
                    # Verificar se há detalhes do erro na resposta
                    error_details = response.json()
                    print(f"Detalhes do erro: {json.dumps(error_details, indent=2)}")
                except Exception:
                    pass
    except Exception as e:
        print(f"Exceção ao testar GET /appointments: {e}")
        print(traceback.format_exc())

if __name__ == "__main__":
    print("=== DIAGNÓSTICO DE PROBLEMAS COM APPOINTMENTS ===")
    
    # Verificar o schema no banco de dados
    check_appointment_schema()
    
    # Tentar operações SQL diretas
    execute_direct_sql()
    
    # Testar endpoints da API
    check_api_endpoints()
    
    print("\n=== DIAGNÓSTICO CONCLUÍDO ===") 