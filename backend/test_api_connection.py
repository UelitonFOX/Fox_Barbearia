import requests
import json

# URL base da API
BASE_URL = "http://localhost:8000"  # Ajuste se a porta for diferente

# Credenciais de login
credentials = {
    "username": "uel.rod@gmail.com",
    "password": "@Dev.Fox@11989"
}

def test_login():
    """Testa o endpoint de login"""
    print("\n=== Testando Login ===")
    try:
        response = requests.post(f"{BASE_URL}/api/v1/auth/login", data=credentials)
        if response.status_code == 200:
            token_data = response.json()
            print("✅ Login bem-sucedido!")
            print(f"Token obtido: {token_data.get('access_token', '')[:20]}...")
            print(f"Dados do usuário: {json.dumps(token_data.get('user', {}), indent=2, ensure_ascii=False)}")
            return token_data.get('access_token')
        else:
            print(f"❌ Falha no login. Status code: {response.status_code}")
            print(f"Resposta: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Erro ao conectar: {e}")
        return None

def test_get_appointments(token):
    """Testa o endpoint de agendamentos"""
    print("\n=== Testando Endpoint de Agendamentos ===")
    if not token:
        print("❌ Não foi possível testar: token não disponível")
        return
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/v1/appointments/", headers=headers)
        
        if response.status_code == 200:
            appointments = response.json()
            print("✅ Endpoint de agendamentos funcionando!")
            print(f"Número de agendamentos retornados: {len(appointments)}")
            
            # Mostra o primeiro agendamento se existir
            if appointments:
                print("\nPrimeiro agendamento:")
                print(json.dumps(appointments[0], indent=2, ensure_ascii=False))
                
                # Verifica se as colunas 'contact' e 'notes' estão presentes
                if 'contact' in appointments[0]:
                    print("✅ Coluna 'contact' presente no resultado!")
                else:
                    print("❌ Coluna 'contact' NÃO encontrada no resultado")
                    
                if 'notes' in appointments[0]:
                    print("✅ Coluna 'notes' presente no resultado!")
                else:
                    print("❌ Coluna 'notes' NÃO encontrada no resultado")
        else:
            print(f"❌ Falha ao acessar agendamentos. Status code: {response.status_code}")
            print(f"Resposta: {response.text}")
    except Exception as e:
        print(f"❌ Erro ao conectar: {e}")

def test_get_dashboard(token):
    """Testa o endpoint do dashboard"""
    print("\n=== Testando Endpoint do Dashboard ===")
    if not token:
        print("❌ Não foi possível testar: token não disponível")
        return
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/v1/dashboard/summary", headers=headers)
        
        if response.status_code == 200:
            dashboard_data = response.json()
            print("✅ Endpoint do dashboard funcionando!")
            print(f"Dados do dashboard: {json.dumps(dashboard_data, indent=2, ensure_ascii=False)}")
        else:
            print(f"❌ Falha ao acessar dashboard. Status code: {response.status_code}")
            print(f"Resposta: {response.text}")
    except Exception as e:
        print(f"❌ Erro ao conectar: {e}")

if __name__ == "__main__":
    print("Iniciando testes da API Fox Barbearia...")
    print(f"API Base URL: {BASE_URL}")
    
    # Testa login
    token = test_login()
    
    # Testa endpoints protegidos
    if token:
        test_get_appointments(token)
        test_get_dashboard(token)
    else:
        print("\n❌ Não foi possível testar os endpoints protegidos devido à falha no login.")
    
    print("\nTestes concluídos.") 