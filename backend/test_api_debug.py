import requests
import json

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

def debug_appointment_model():
    """Tenta acessar um endpoint que revela a estrutura do modelo Appointment"""
    print("\n=== Depurando Modelo de Appointment ===")
    token = get_token()
    if not token:
        print("❌ Não foi possível obter token")
        return
    
    try:
        # Tenta criar um appointment para ver erros específicos
        headers = {"Authorization": f"Bearer {token}"}
        
        # Dados básicos para um agendamento
        appointment_data = {
            "client_name": "Cliente Teste",
            "contact": "11999999999",
            "service_id": 1,  # Ajuste para um ID válido
            "user_id": 4,     # Seu ID de usuário 
            "date_time": "2023-05-10T14:00:00",
            "status": "scheduled",
            "notes": "Teste de agendamento"
        }
        
        print(f"Tentando criar um agendamento com os dados: {json.dumps(appointment_data, indent=2)}")
        response = requests.post(
            f"{BASE_URL}/api/v1/appointments/", 
            headers=headers, 
            json=appointment_data
        )
        
        print(f"Status code: {response.status_code}")
        print(f"Resposta: {response.text}")
        
    except Exception as e:
        print(f"❌ Erro ao conectar: {e}")

if __name__ == "__main__":
    print("Iniciando depuração do modelo de Appointment...")
    debug_appointment_model()
    print("\nDepuração concluída.") 