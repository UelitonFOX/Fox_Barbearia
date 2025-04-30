import requests
import json

# Configurações
BASE_URL = 'http://localhost:8000/api/v1'
USERNAME = 'admin'
PASSWORD = 'admin'

# Autenticar e obter token
def get_token():
    url = f"{BASE_URL}/auth/login"
    
    # O FastAPI espera um form-data para o OAuth2PasswordRequestForm
    response = requests.post(
        url,
        data={"username": USERNAME, "password": PASSWORD}
    )
    
    result = response.json()
    
    if response.status_code == 200 and 'access_token' in result:
        return result['access_token']
    else:
        print(f"Erro na autenticação: {result}")
        return None

# Testar acesso aos serviços
def test_services(token):
    url = f"{BASE_URL}/services/"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        services = response.json()
        print(f"Sucesso! Serviços encontrados: {len(services)}")
        print(json.dumps(services, indent=2))
    else:
        print(f"Erro ao acessar serviços: {response.status_code}")
        print(response.text)

# Executar teste
if __name__ == "__main__":
    token = get_token()
    if token:
        print(f"Token obtido: {token[:10]}...")
        test_services(token)
    else:
        print("Não foi possível obter o token.") 