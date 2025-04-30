import os
import sys
import json
import requests
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

API_BASE_URL = "http://localhost:8000/api/v1"

def test_health():
    """Testar endpoint de saúde"""
    try:
        print("\n📊 Testando endpoint de saúde...")
        response = requests.get(f"{API_BASE_URL}/health")
        
        print(f"Status: {response.status_code}")
        print(f"Resposta: {response.json()}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        return False

def get_token(username, password):
    """Obter token de autenticação"""
    try:
        print(f"\n🔐 Autenticando usuário: {username}...")
        
        data = {
            "username": username,
            "password": password
        }
        
        response = requests.post(
            f"{API_BASE_URL}/auth/login",
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code == 200:
            token_data = response.json()
            print("✅ Login bem-sucedido!")
            token = token_data.get("access_token")
            if token:
                print(f"Token: {token[:15]}...")
                return token
            else:
                print("❌ Token não encontrado na resposta")
                return None
        else:
            print(f"❌ Falha no login: {response.status_code}")
            print(f"Detalhes: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        return None

def test_protected_endpoint(token, endpoint):
    """Testar um endpoint protegido"""
    try:
        print(f"\n🔍 Testando endpoint: {endpoint}")
        
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        response = requests.get(f"{API_BASE_URL}/{endpoint}", headers=headers)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Acesso permitido!")
            
            # Exibir um resumo da resposta
            data = response.json()
            if isinstance(data, list):
                print(f"Recebidos {len(data)} registros")
                if len(data) > 0:
                    print("Exemplo do primeiro registro:")
                    print(json.dumps(data[0], indent=2))
            else:
                print("Dados recebidos:")
                print(json.dumps(data, indent=2)[:500] + "..." if len(json.dumps(data)) > 500 else json.dumps(data, indent=2))
                
            return True
        else:
            print(f"❌ Falha no acesso: {response.status_code}")
            print(f"Detalhes: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        return False

if __name__ == "__main__":
    print("\n🔍 DEBUG DA API FOX BARBEARIA 🔍")
    print("=" * 50)
    
    # Testar saúde da API
    if not test_health():
        print("\n❌ Verificação de saúde falhou! Certifique-se que o servidor está rodando.")
        sys.exit(1)
    
    # Solicitar credenciais
    print("\nInsira as credenciais para teste:")
    username = input("Usuário: ")
    password = input("Senha: ")
    
    # Obter token
    token = get_token(username, password)
    
    if not token:
        print("\n❌ Não foi possível obter o token! Verifique suas credenciais.")
        sys.exit(1)
    
    # Endpoints a serem testados
    endpoints = [
        "users/me",
        "users",
        "services",
        "attendances",
        "appointments"
    ]
    
    # Testar cada endpoint
    results = {}
    for endpoint in endpoints:
        results[endpoint] = test_protected_endpoint(token, endpoint)
    
    # Resumo dos testes
    print("\n" + "=" * 50)
    print("📋 RESUMO DOS TESTES:")
    
    for endpoint, success in results.items():
        status = "✅ OK" if success else "❌ FALHA"
        print(f"{status} - {endpoint}")
    
    # Verificar se todos os testes passaram
    if all(results.values()):
        print("\n✅ Todos os endpoints estão funcionando corretamente!")
    else:
        print("\n❌ Alguns endpoints apresentaram falhas.")
        
    print("\nSe houver problemas, verifique:")
    print("1. Se o servidor backend está rodando")
    print("2. Se as credenciais estão corretas")
    print("3. Se o token está sendo gerado corretamente")
    print("4. Se os endpoints estão configurados corretamente no backend") 