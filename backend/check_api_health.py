import os
import sys
import requests
import json
from dotenv import load_dotenv
import psycopg2
from urllib.parse import urlparse

# Carregar variáveis de ambiente
load_dotenv()

def check_api_health():
    """Verifica se a API está funcionando corretamente"""
    try:
        print("\n=== Verificando saúde da API ===")
        response = requests.get("http://localhost:8000/api/v1/health")
        
        if response.status_code == 200:
            print("✅ API está funcionando corretamente!")
            print(f"Resposta: {response.json()}")
            return True
        else:
            print(f"❌ API retornou código de status {response.status_code}")
            print(f"Resposta: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Não foi possível conectar à API. Verifique se o servidor está em execução.")
        return False
    except Exception as e:
        print(f"❌ Erro ao verificar saúde da API: {str(e)}")
        return False

def check_db_connection():
    """Verifica a conexão com o banco de dados"""
    try:
        print("\n=== Verificando conexão com o banco de dados ===")
        
        # Obter URL de conexão do banco
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            print("❌ Variável DATABASE_URL não encontrada no arquivo .env")
            return False
        
        print(f"🔍 Tentando conectar a: {database_url.split('@')[1]}")
        
        # Parâmetros de conexão
        parsed_url = urlparse(database_url)
        dbname = parsed_url.path[1:]  # Remover a barra inicial
        user = parsed_url.username
        password = parsed_url.password
        host = parsed_url.hostname
        port = parsed_url.port
        
        # Conectar ao banco
        conn = psycopg2.connect(
            dbname=dbname,
            user=user,
            password=password,
            host=host,
            port=port
        )
        
        # Criar cursor e executar consulta de teste
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        db_version = cursor.fetchone()
        
        # Verificar tabelas principais
        print("\n🔍 Verificando tabelas principais:")
        tables = ["users", "services", "attendances", "appointments"]
        for table in tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table};")
                count = cursor.fetchone()[0]
                print(f"  ✓ Tabela '{table}': {count} registros")
            except Exception as e:
                print(f"  ✗ Erro ao acessar tabela '{table}': {str(e)}")
        
        # Fechar conexão
        cursor.close()
        conn.close()
        
        print(f"\n✅ Conexão com o banco de dados estabelecida com sucesso!")
        print(f"Versão do PostgreSQL: {db_version[0]}")
        return True
    
    except psycopg2.OperationalError as e:
        print(f"❌ Erro de conexão com o banco de dados: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Erro ao verificar conexão com o banco: {str(e)}")
        return False

def check_cors_config():
    """Verifica a configuração de CORS"""
    try:
        print("\n=== Verificando configuração de CORS ===")
        
        # Caminho para o arquivo de configuração
        config_path = os.path.join("app", "core", "config.py")
        
        if not os.path.exists(config_path):
            print(f"❌ Arquivo de configuração não encontrado: {config_path}")
            return False
        
        # Ler o arquivo
        with open(config_path, "r") as f:
            content = f.read()
        
        # Verificar origens CORS
        if "CORS_ORIGINS" in content:
            print("✅ Configuração de CORS encontrada!")
            
            # Tentar extrair as origens
            import re
            cors_match = re.search(r'CORS_ORIGINS:\s*list\s*=\s*\[(.*?)\]', content, re.DOTALL)
            if cors_match:
                origins = cors_match.group(1)
                print(f"Origens permitidas: {origins}")
                
                # Verificar se localhost:5173 está incluído
                if "localhost:5173" in origins:
                    print("✅ Frontend local (localhost:5173) está permitido!")
                else:
                    print("❌ Frontend local (localhost:5173) NÃO está na lista de CORS!")
            else:
                print("⚠️ Não foi possível extrair a lista de origens CORS")
        else:
            print("❌ Configuração de CORS não encontrada no arquivo!")
            return False
        
        return True
    except Exception as e:
        print(f"❌ Erro ao verificar configuração de CORS: {str(e)}")
        return False

def check_environment():
    """Verifica variáveis de ambiente críticas"""
    print("\n=== Verificando variáveis de ambiente ===")
    
    # Lista de variáveis críticas
    critical_vars = [
        "DATABASE_URL",
        "SECRET_KEY",
        "SUPABASE_URL",
        "SUPABASE_KEY"
    ]
    
    all_good = True
    for var in critical_vars:
        value = os.getenv(var)
        if value:
            masked_value = value[:10] + "..." if len(value) > 10 else value
            print(f"✅ {var}: {masked_value}")
        else:
            print(f"❌ {var}: Não definido!")
            all_good = False
    
    return all_good

if __name__ == "__main__":
    print("\n🔍 DIAGNÓSTICO DE SISTEMA - FOX BARBEARIA 🔍")
    print("=" * 50)
    
    # Executar verificações
    env_check = check_environment()
    api_check = check_api_health()
    db_check = check_db_connection()
    cors_check = check_cors_config()
    
    print("\n" + "=" * 50)
    print("📊 RESUMO DO DIAGNÓSTICO:")
    print(f"✓ Variáveis de ambiente: {'OK' if env_check else 'FALHA'}")
    print(f"✓ API: {'OK' if api_check else 'FALHA'}")
    print(f"✓ Banco de dados: {'OK' if db_check else 'FALHA'}")
    print(f"✓ Configuração CORS: {'OK' if cors_check else 'FALHA'}")
    
    # Recomendações baseadas nos resultados
    print("\n📋 RECOMENDAÇÕES:")
    if not api_check:
        print("• Verifique se o servidor backend está rodando (python run.py)")
    if not db_check:
        print("• Verifique as credenciais do banco de dados no arquivo .env")
        print("• Verifique se o banco de dados Supabase está acessível (pode haver problemas temporários)")
    if not cors_check:
        print("• Verifique a configuração de CORS para permitir o frontend")
    
    if all([env_check, api_check, db_check, cors_check]):
        print("🎉 Todos os sistemas estão funcionando corretamente!")
    else:
        print("\n⚠️ Foram encontrados problemas que precisam ser resolvidos.")
    
    print("\nSe o problema persistir, reinicie tanto o backend quanto o frontend:")
    print("1. Backend: cd backend && python run.py")
    print("2. Frontend: cd frontend && npm run dev") 