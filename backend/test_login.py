"""
Script para testar o login usando requests
"""
import requests
import json

# Configurações
BASE_URL = 'http://localhost:8000/api/v1'
USERNAME = 'admin@foxbarbearia.com'
PASSWORD = 'admin123'

def test_login():
    """
    Testa o login na API
    """
    print("=== Testando Login na API ===")
    
    # Endpoint de login
    url = f"{BASE_URL}/auth/login"
    
    print(f"URL: {url}")
    print(f"Username: {USERNAME}")
    print(f"Password: {PASSWORD}")
    
    # Fazer a requisição com form-data (como o FastAPI espera)
    try:
        print("\nEnviando requisição POST...")
        response = requests.post(
            url,
            data={"username": USERNAME, "password": PASSWORD},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        # Mostrar detalhes da resposta
        print(f"\nStatus Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        # Tentar decodificar o corpo da resposta
        try:
            data = response.json()
            print(f"Resposta (JSON): {json.dumps(data, indent=2)}")
        except:
            print(f"Resposta (texto): {response.text}")
        
        # Verificar se o login foi bem-sucedido
        if response.status_code == 200 and 'access_token' in response.json():
            print("\n✅ Login bem-sucedido!")
            token = response.json()['access_token']
            print(f"Token: {token[:20]}...")
            
            # Testar acesso a uma rota protegida
            print("\nTestando acesso a uma rota protegida...")
            protected_url = f"{BASE_URL}/users/me"
            
            auth_response = requests.get(
                protected_url,
                headers={"Authorization": f"Bearer {token}"}
            )
            
            print(f"Status: {auth_response.status_code}")
            if auth_response.status_code == 200:
                print(f"Dados do usuário: {auth_response.json()}")
                print("✅ Acesso autenticado bem-sucedido!")
            else:
                print(f"Falha no acesso autenticado: {auth_response.text}")
        else:
            print("\n❌ Login falhou!")
            
    except requests.RequestException as e:
        print(f"\n❌ Erro na requisição: {str(e)}")
    except Exception as e:
        print(f"\n❌ Erro não esperado: {str(e)}")

if __name__ == "__main__":
    test_login()
    print("\n=== Teste concluído ===") 