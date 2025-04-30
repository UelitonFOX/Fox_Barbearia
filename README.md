# 🦊 Fox Barbearia - Sistema Interno

Sistema interno para gestão de atendimentos da Fox Barbearia.  
Desenvolvido em React/TypeScript (frontend) e FastAPI (backend), com banco de dados PostgreSQL no Supabase.

---

## 🚀 Funcionalidades Principais

- Cadastro rápido de atendimentos
- Controle de barbeiros com login individual
- Dashboard com total de atendimentos e faturamento diário
- Relatórios diários, semanais e mensais
- Controle de caixa diário
- Agenda de horários (agendamentos futuros) com layout moderno e intuitivo
- Cadastro de serviços padrão
- Opção de aplicar desconto por atendimento
- Layout responsivo para celular e desktop
- Permissões de usuários (Admin e Barbeiro)

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 18 + TypeScript + Tailwind CSS + Vite
- **Backend:** FastAPI (Python 3.10+)
- **Banco de Dados:** PostgreSQL (hospedado no Supabase)
- **Autenticação:** JWT + Supabase Auth
- **Gráficos:** Chart.js
- **API:** RESTful API

---

## 📄 Modelagem de Banco de Dados

### Tabelas:

#### `users`
| Campo | Tipo | Descrição |
|:------|:-----|:----------|
| id | PK | Identificador único |
| name | String | Nome do usuário |
| email | String | Email do usuário |
| username | String | Nome de usuário para login |
| password | Hash | Senha criptografada |
| user_type | Enum (`admin` ou `barber`) | Nível de permissão |
| active | Boolean | Se o usuário está ativo |

---

#### `services`
| Campo | Tipo | Descrição |
|:------|:-----|:----------|
| id | PK | Identificador único |
| name | String | Nome do serviço |
| price | Decimal | Valor padrão do serviço |
| duration_minutes | Integer | Duração do serviço em minutos |
| description | Text | Descrição do serviço (opcional) |

---

#### `attendances`
| Campo | Tipo | Descrição |
|:------|:-----|:----------|
| id | PK | Identificador único |
| user_id | FK (users) | Usuário que realizou |
| service_id | FK (services) | Serviço realizado |
| original_value | Decimal | Valor do serviço antes do desconto |
| discount_amount | Decimal | Valor de desconto aplicado |
| final_value | Decimal | Valor final cobrado |
| payment_method | Enum (`pix`, `card`, `cash`) | Forma de pagamento |
| date_time | Timestamp | Data e hora do atendimento |

---

#### `appointments`
| Campo | Tipo | Descrição |
|:------|:-----|:----------|
| id | PK | Identificador único |
| client_name | String | Nome do cliente |
| user_id | FK (users) | Barbeiro responsável |
| service_id | FK (services) | Serviço agendado |
| date_time | Timestamp | Data e hora agendada |
| contact | String | Contato do cliente (opcional) |
| notes | Text | Observações (opcional) |
| status | Enum (`scheduled`, `completed`, `canceled`) | Status do agendamento |

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
| Visualizar relatórios detalhados | ❌ | ✅ |

---

## ⚡ Observações

- Comissão e pagamento serão gerenciados manualmente, baseados no relatório diário de atendimentos.
- Atendimentos sem registro no sistema não são considerados para pagamento.

---

## 📋 Checklist de Funcionalidades

- [x] Estrutura base do projeto (frontend e backend)
- [x] Tela de Login com sistema de autenticação JWT
- [x] Dashboard (resumo diário)
- [x] Cadastro de Atendimento (com desconto opcional)
- [x] Relatório de Atendimentos
- [x] Agenda de Agendamentos com layout moderno
- [x] Tela de Cadastro de Serviços
- [x] Controle de Caixa Diário
- [x] Permissões de Usuário
- [x] Integração com Supabase (PostgreSQL)
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
   - Criar um arquivo `.env` com base no exemplo `.env.example`
   - Definir a variável `DATABASE_URL` com a string de conexão do PostgreSQL
   - Definir a variável `SECRET_KEY` para assinatura de tokens JWT
   - Definir as configurações de CORS conforme necessário

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

3. Configurar variáveis de ambiente:
   - Criar um arquivo `.env.local` com base no exemplo `.env.example`
   - Definir a variável `VITE_API_BASE_URL` apontando para o backend

4. Iniciar servidor de desenvolvimento:
```
npm run dev
```

O frontend estará disponível em: http://localhost:5173

---

## 📖 Guia de Uso

### Dashboard

O Dashboard exibe um resumo dos atendimentos do dia atual, incluindo:
- Total de atendimentos realizados
- Faturamento total (valor original, descontos e valor final)
- Distribuição por formas de pagamento
- Próximos agendamentos do dia
- Resumo por barbeiro (visível apenas para administradores)

Cada usuário vê apenas seus próprios atendimentos, enquanto administradores têm acesso ao resumo de todos os barbeiros.

### Atendimentos

Na seção de Atendimentos você pode:
- Visualizar todos os atendimentos do período selecionado
- Registrar novos atendimentos
- Aplicar descontos opcionais
- Escolher forma de pagamento
- Filtrar por data e barbeiro (apenas admin)

### Serviços

A página de Serviços permite:
- Visualizar todos os serviços disponíveis (para todos os usuários)
- Adicionar, editar ou remover serviços (apenas administradores)
- Ver detalhes como nome, descrição, duração e preço

### Agenda de Agendamentos

Na página de Agenda você pode:
1. Visualizar todos os agendamentos por data em um layout moderno e intuitivo
2. Navegar entre dias usando controles rápidos de anterior/próximo
3. Identificar facilmente o status dos agendamentos através de cores indicativas
4. Filtrar agendamentos por data específica
5. Adicionar novos agendamentos com:
   - Nome do cliente
   - Serviço desejado
   - Data e hora
   - Barbeiro responsável (administrador pode escolher qualquer barbeiro)
   - Contato do cliente e anotações adicionais
6. Editar agendamentos existentes
7. Cancelar agendamentos

### Relatórios

Na página de Relatórios você pode:
1. Gerar relatórios detalhados com base em diferentes períodos:
   - Diário: informações de um único dia
   - Semanal: dados acumulados de uma semana
   - Mensal: visão geral de um mês inteiro
2. Visualizar gráficos e indicadores:
   - Evolução do faturamento no período
   - Distribuição por forma de pagamento
   - Top 5 serviços mais realizados
3. Filtrar os dados por barbeiro específico (apenas para administradores)

---

## 📜 Autor

Sistema desenvolvido para Fox Barbearia - Jardim Alegre, PR.  
Projeto organizado por Ueliton Fox.

---

## Solução de Problemas

### Problema: Tela preta na página de atendimentos

Se você estiver vendo uma tela preta na página de atendimentos (http://localhost:5173/atendimentos), isso foi corrigido com a adição de melhor contraste nos elementos da página. 

Para aplicar a correção:
1. Certifique-se de que o frontend está rodando com a versão mais recente do código
2. Se o problema persistir, limpe o cache do navegador (Ctrl+F5)

### Atualizações Recentes

A página de Agenda (http://localhost:5175/agenda) recebeu uma atualização significativa no layout:
- Design moderno com melhor organização dos elementos
- Indicadores visuais por cores para cada status de agendamento
- Navegação simplificada entre dias
- Melhor visualização das informações de contato e serviço
- Compatibilidade aprimorada com dispositivos móveis

### Problema: Páginas de relatórios e agenda não carregam dados do banco

Se as páginas de relatórios e agenda não estiverem carregando os dados do banco de dados:

1. **Verifique se o backend está rodando:**
   ```
   cd backend
   python run.py
   ```

2. **Execute o diagnóstico do sistema:**
   ```
   cd backend
   python check_api_health.py
   ```

3. **Verifique a conexão no frontend:**
   - Observe o alerta de conexão no topo da página (se existir)
   - Clique em "Tentar novamente" para reconectar

4. **Possíveis soluções:**
   - Reinicie tanto o backend quanto o frontend
   - Verifique se o arquivo .env do backend tem as credenciais corretas
   - Confira se o banco de dados Supabase está online

### Troubleshooting geral:

1. Limpe o cache do navegador (Ctrl+F5)
2. Reinicie o backend: `cd backend && python run.py`
3. Reinicie o frontend: `cd frontend && npm run dev`
4. Verifique os logs no console do navegador para erros específicos

---
