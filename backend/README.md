# Backend Fox Barbearia

API REST desenvolvida com FastAPI para o sistema interno da Fox Barbearia.

## Tecnologias Utilizadas

- FastAPI
- SQLAlchemy (ORM)
- PostgreSQL (Supabase)
- JWT para autenticação

## Configuração do Ambiente

1. Criar ambiente virtual:
```
python -m venv venv
```

2. Ativar ambiente virtual:
```
# Windows
.\venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Instalar dependências:
```
pip install -r requirements.txt
```

4. Configurar variáveis de ambiente:
   - Renomeie o arquivo `.env.example` para `.env`
   - Edite as variáveis conforme sua configuração

## Rodando o Servidor

Para iniciar o servidor de desenvolvimento:

```
python run.py
```

O servidor estará disponível em: http://localhost:8000

A documentação da API estará disponível em: http://localhost:8000/docs

## Estrutura do Projeto

- `app/main.py`: Ponto de entrada da aplicação
- `app/api/`: Rotas da API
- `app/models/`: Modelos de dados (SQLAlchemy)
- `app/schemas/`: Esquemas Pydantic para validação
- `app/core/`: Configurações e utilidades
- `app/db/`: Configuração do banco de dados

## Endpoints da API

### Autenticação
- POST `/api/v1/auth/login`: Autenticar usuário

### Usuários
- GET `/api/v1/users/`: Listar usuários (admin)
- POST `/api/v1/users/`: Criar usuário (admin)
- GET `/api/v1/users/me`: Obter usuário logado
- GET `/api/v1/users/{id}`: Obter usuário específico (admin)
- PUT `/api/v1/users/{id}`: Atualizar usuário (admin)

### Serviços
- GET `/api/v1/services/`: Listar serviços
- POST `/api/v1/services/`: Criar serviço (admin)
- GET `/api/v1/services/{id}`: Obter serviço específico
- PUT `/api/v1/services/{id}`: Atualizar serviço (admin)
- DELETE `/api/v1/services/{id}`: Excluir serviço (admin)

### Atendimentos
- GET `/api/v1/attendances/`: Listar atendimentos
- POST `/api/v1/attendances/`: Criar atendimento
- GET `/api/v1/attendances/{id}`: Obter atendimento específico
- PUT `/api/v1/attendances/{id}`: Atualizar atendimento (admin)
- DELETE `/api/v1/attendances/{id}`: Excluir atendimento (admin)
- GET `/api/v1/attendances/summary/daily`: Resumo diário

### Agendamentos
- GET `/api/v1/appointments/`: Listar agendamentos
- POST `/api/v1/appointments/`: Criar agendamento
- GET `/api/v1/appointments/{id}`: Obter agendamento específico
- PUT `/api/v1/appointments/{id}`: Atualizar agendamento
- DELETE `/api/v1/appointments/{id}`: Excluir agendamento 