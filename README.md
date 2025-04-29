# 🦊 Fox Barbearia - Sistema Interno

Sistema interno para gestão de atendimentos da Fox Barbearia.  
Desenvolvido em React (frontend) e Flask ou FastAPI (backend), com banco de dados Supabase.

---

## 🚀 Funcionalidades Principais

- Cadastro rápido de atendimentos
- Controle de barbeiros com login individual
- Dashboard com total de atendimentos e faturamento diário
- Relatórios diários, semanais e mensais
- Controle de caixa diário
- Agenda de horários (agendamentos futuros)
- Cadastro de serviços padrão
- Opção de aplicar desconto por atendimento
- Layout responsivo para celular e desktop
- Permissões de usuários (Admin e Barbeiro)

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React + Tailwind CSS
- **Backend:** Flask ou FastAPI
- **Banco de Dados:** Supabase (PostgreSQL gerenciado)
- **API:** RESTful API

---

## 📄 Modelagem de Banco de Dados (Supabase)

### Tabelas:

#### `usuarios`
| Campo | Tipo | Descrição |
|:------|:-----|:----------|
| id | PK | Identificador único |
| nome | String | Nome do usuário |
| email | String (opcional) | Email do usuário |
| senha | Hash | Senha criptografada |
| tipo_usuario | Enum (`admin` ou `barbeiro`) | Nível de permissão |
| ativo | Boolean | Se o usuário está ativo |

---

#### `servicos`
| Campo | Tipo | Descrição |
|:------|:-----|:----------|
| id | PK | Identificador único |
| nome_servico | String | Nome do serviço |
| preco_padrao | Decimal | Valor padrão do serviço |

---

#### `atendimentos`
| Campo | Tipo | Descrição |
|:------|:-----|:----------|
| id | PK | Identificador único |
| usuario_id | FK (usuarios) | Usuário que realizou |
| servico_id | FK (servicos) | Serviço realizado |
| valor_original | Decimal | Valor do serviço antes do desconto |
| desconto_aplicado | Decimal | Valor de desconto aplicado |
| valor_final | Decimal | Valor final cobrado |
| forma_pagamento | Enum (Pix, Cartão, Dinheiro) | Forma de pagamento |
| data_hora_atendimento | Timestamp | Data e hora do atendimento |

---

#### `agendamentos`
| Campo | Tipo | Descrição |
|:------|:-----|:----------|
| id | PK | Identificador único |
| cliente_nome | String (opcional) | Nome do cliente |
| usuario_id | FK (usuarios) | Barbeiro responsável |
| servico_id | FK (servicos) | Serviço agendado |
| data_hora_agendada | Timestamp | Data e hora agendada |
| status | Enum (`agendado`, `concluido`, `cancelado`) | Status do agendamento |

---

## 🎨 Identidade Visual

- Nome do sistema: **Fox Barbearia**
- Paleta de cores:
  - Fundo: Preto ou Cinza escuro
  - Botões principais: Laranja forte (#FFA500)
  - Textos: Branco (#FFFFFF)
  - Gráficos e destaques: Laranja e Amarelo
- Instagram: [@fox.barbearia](https://www.instagram.com/fox.barbearia)
- Endereço: Av Paraná, 434, Jardim Alegre - PR, CEP 86860-000

---

## 👥 Permissões de Usuários

| Ação | Barbeiro | Admin |
|:-----|:---------|:------|
| Registrar atendimento | ✅ | ✅ |
| Aplicar desconto | ✅ | ✅ |
| Ver atendimentos próprios | ✅ | ✅ |
| Ver todos atendimentos | ❌ | ✅ |
| Editar atendimentos | ❌ | ✅ |
| Cadastrar serviços | ❌ | ✅ |
| Cadastrar novos usuários | ❌ | ✅ |

---

## ⚡ Observações

- Comissão e pagamento serão gerenciados manualmente, baseados no relatório diário de atendimentos.
- Atendimentos sem registro no sistema não são considerados para pagamento.

---

## 📋 Checklist de Funcionalidades

- [x] Estrutura base do projeto (frontend e backend)
- [x] Tela de Login
- [x] Dashboard (resumo diário)
- [ ] Cadastro de Atendimento (com desconto opcional)
- [ ] Relatório de Atendimentos
- [ ] Agenda de Agendamentos
- [ ] Tela de Cadastro de Serviços
- [ ] Controle de Caixa Diário
- [x] Permissões de Usuário
- [x] Integração com Supabase (configuração inicial)
- [x] Design responsivo (Mobile First)

---

## 🚀 Iniciar o Projeto

### Backend (FastAPI)

1. Entrar na pasta do backend:
```
cd backend
```

2. Criar ambiente virtual Python:
```
python -m venv venv
```

3. Ativar o ambiente virtual:
```
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

4. Instalar dependências:
```
pip install -r requirements.txt
```

5. Configurar variáveis de ambiente:
   - Editar o arquivo `.env` com as configurações do Supabase

6. Iniciar o servidor:
```
python run.py
```

O backend estará disponível em: http://localhost:8000
A documentação da API estará em: http://localhost:8000/docs

### Frontend (React)

1. Entrar na pasta do frontend:
```
cd frontend
```

2. Instalar dependências:
```
npm install
```

3. Iniciar servidor de desenvolvimento:
```
npm run dev
```

O frontend estará disponível em: http://localhost:5173

---

## 📜 Autor

Sistema desenvolvido para Fox Barbearia - Jardim Alegre, PR.  
Projeto organizado por [Ueliton Fox](https://www.instagram.com/ueliton_fox).

---
