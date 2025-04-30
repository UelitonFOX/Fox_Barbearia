import requests
import json
import traceback
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

def debug_create_appointment():
    """Teste de criação de agendamento com debug detalhado"""
    print("\n=== DEBUG DETALHADO - Criação de Agendamento ===")
    token = get_token()
    if not token:
        print("❌ Não foi possível obter token")
        return
    
    # Data para amanhã às 15:00 (hora diferente para evitar conflito)
    tomorrow = datetime.now() + timedelta(days=1)
    appointment_time = tomorrow.replace(hour=15, minute=0, second=0, microsecond=0)
    
    try:
        # Tenta criar um appointment com os campos corretos
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Testa três versões diferentes do formato de dados
        data_variations = [
            # 1. Versão com date_time
            {
                "client_name": "Cliente Teste Debug 1",
                "contact": "11999999999",
                "service_id": 1,
                "user_id": 4,
                "date_time": appointment_time.isoformat(),
                "status": "scheduled",
                "notes": "Teste debug 1"
            },
            # 2. Versão com scheduled_datetime
            {
                "client_name": "Cliente Teste Debug 2",
                "contact": "11999999999",
                "service_id": 1,
                "user_id": 4,
                "scheduled_datetime": (appointment_time + timedelta(minutes=30)).isoformat(),
                "status": "scheduled",
                "notes": "Teste debug 2"
            },
            # 3. Versão simplificada com apenas campos obrigatórios
            {
                "client_name": "Cliente Teste Debug 3",
                "service_id": 1,
                "user_id": 4,
                "date_time": (appointment_time + timedelta(hours=1)).isoformat(),
                "status": "scheduled"
            }
        ]
        
        # Testar cada variação
        for i, data in enumerate(data_variations):
            print(f"\n[Teste {i+1}] Tentando criar um agendamento com os dados: {json.dumps(data, indent=2)}")
            try:
                response = requests.post(
                    f"{BASE_URL}/api/v1/appointments/", 
                    headers=headers, 
                    json=data,
                    timeout=30
                )
                
                print(f"[Teste {i+1}] Status code: {response.status_code}")
                if response.status_code == 201:
                    print(f"[Teste {i+1}] ✅ Agendamento criado com sucesso!")
                    print(f"[Teste {i+1}] Resposta: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
                else:
                    print(f"[Teste {i+1}] ❌ Falha ao criar agendamento")
                    print(f"[Teste {i+1}] Resposta: {response.text}")
            except Exception as e:
                print(f"[Teste {i+1}] ❌ Exceção: {e}")
                print(traceback.format_exc())
        
    except Exception as e:
        print(f"❌ Erro geral: {e}")
        print(traceback.format_exc())

if __name__ == "__main__":
    print("Iniciando debug detalhado de criação de agendamento...")
    debug_create_appointment()
    print("\nDebug concluído.") 