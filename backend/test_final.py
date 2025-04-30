import requests
import json
from datetime import datetime, timedelta

# URL base da API
BASE_URL = "http://localhost:8000"  # Ajuste se a porta for diferente

# Credenciais de login
credentials = {
    "username": "uel.rod@gmail.com",
    "password": "@Dev.Fox@11989"
}

def get_token():
    """Obtém o token de autenticação"""
    try:
        response = requests.post(f"{BASE_URL}/api/v1/auth/login", data=credentials)
        if response.status_code == 200:
            return response.json().get('access_token')
        return None
    except Exception:
        return None

def test_create_appointment():
    """Teste de criação de agendamento com os campos corretos"""
    print("\n=== Testando Criação de Agendamento ===")
    token = get_token()
    if not token:
        print("❌ Não foi possível obter token")
        return
    
    # Data para amanhã às 14:00
    tomorrow = datetime.now() + timedelta(days=1)
    appointment_time = tomorrow.replace(hour=14, minute=0, second=0, microsecond=0)
    
    try:
        # Tenta criar um appointment com os campos corretos
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Dados corretos para um agendamento
        appointment_data = {
            "client_name": "Cliente Teste Final",
            "contact": "11999999999",
            "service_id": 1,  # Ajuste para um ID válido
            "user_id": 4,     # Seu ID de usuário 
            "date_time": appointment_time.isoformat(),
            "status": "scheduled",
            "notes": "Teste final de agendamento"
        }
        
        print(f"Tentando criar um agendamento com os dados: {json.dumps(appointment_data, indent=2)}")
        response = requests.post(
            f"{BASE_URL}/api/v1/appointments/", 
            headers=headers, 
            json=appointment_data
        )
        
        print(f"Status code: {response.status_code}")
        if response.status_code == 201:
            print("✅ Agendamento criado com sucesso!")
            print(f"Resposta: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        else:
            print(f"❌ Falha ao criar agendamento")
            print(f"Resposta: {response.text}")
        
    except Exception as e:
        print(f"❌ Erro ao conectar: {e}")

def test_list_appointments():
    """Teste de listagem de agendamentos"""
    print("\n=== Testando Listagem de Agendamentos ===")
    token = get_token()
    if not token:
        print("❌ Não foi possível obter token")
        return
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/v1/appointments/", headers=headers)
        
        print(f"Status code: {response.status_code}")
        if response.status_code == 200:
            appointments = response.json()
            print("✅ Listagem de agendamentos funcionando!")
            print(f"Número de agendamentos retornados: {len(appointments)}")
            
            # Mostra o primeiro agendamento se existir
            if appointments:
                print("\nPrimeiro agendamento:")
                print(json.dumps(appointments[0], indent=2, ensure_ascii=False))
        else:
            print(f"❌ Falha ao listar agendamentos")
            print(f"Resposta: {response.text}")
        
    except Exception as e:
        print(f"❌ Erro ao conectar: {e}")

if __name__ == "__main__":
    print("Iniciando testes finais do sistema...")
    
    # Testando criação de agendamento
    test_create_appointment()
    
    # Testando listagem de agendamentos
    test_list_appointments()
    
    print("\nTestes concluídos.") 