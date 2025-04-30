# 🦊 Fox Barbearia - Lista de Tarefas

## 🚀 Funcionalidades a Implementar

### Prioridade Alta [✓ Concluídas]
- [x] CRUD completo de serviços
- [x] CRUD completo de barbeiros (admin only)
- [x] Cadastro de atendimentos (realizado pelo barbeiro)
- [x] Dashboard com contagens e totais diários
- [x] Sistema de login seguro com autenticação JWT
- [x] Agenda de agendamentos futuros
- [x] Relatório detalhado por período (dia, semana, mês)
- [x] Lógica para controle de caixa diário
- [x] Modernização do layout da página de Agenda

### Próximas Implementações
- [ ] Exportação de relatórios para PDF
- [ ] Recuperação de senha
- [ ] Notificações para agendamentos
- [ ] Melhorias em gráficos e visualizações
- [ ] Upload de imagens para serviços

### Melhorias Técnicas
- [ ] Adicionar testes unitários no backend
- [ ] Adicionar testes E2E no frontend
- [ ] Implementar CI/CD para deploy automático
- [ ] Melhorar documentação da API
- [ ] Otimizar consultas ao banco de dados
- [ ] Implementar migrations com Alembic
- [x] Scripts utilitários para manutenção do banco de dados
- [x] Ferramentas de diagnóstico e debug

---

## ✅ Funcionalidades Concluídas

### Estrutura e Configuração
- [x] Criar projeto React para frontend
- [x] Criar projeto FastAPI para backend
- [x] Configurar banco de dados no Supabase
- [x] Configurar conexão segura do backend com Supabase
- [x] Separar Frontend e Backend em pastas distintas (`/frontend`, `/backend`)

### Autenticação
- [x] Criar sistema de login com JWT
- [x] Implementar login por tipo de usuário (`admin` ou `barber`)
- [x] Botão de revelar senha no login
- [x] Tela de login responsiva
- [x] Sessão armazenada até logout manual

### Usuários
- [x] Criar modelo `User` com campos necessários
- [x] Implementar tipos de usuário (`admin` e `barber`)
- [x] CRUD completo de usuários (admin)
- [x] Modificar senha pelo usuário

### Atendimentos
- [x] Criar modelo `Attendance` com todos os campos necessários
- [x] Implementar tela de novo atendimento
- [x] Adicionar campo de desconto opcional
- [x] Cálculo automático do valor final
- [x] Seleção de forma de pagamento
- [x] Registro automático da data e hora
- [x] Associação ao usuário logado
- [x] Filtros por data e barbeiro (admin)

### Dashboard
- [x] Resumo diário de atendimentos
- [x] Contadores e totais
- [x] Gráfico de distribuição por forma de pagamento
- [x] Próximos agendamentos do dia
- [x] Resumo por barbeiro (admin)

### Agendamentos
- [x] Modelo `Appointment` para agendamentos
- [x] Tela de agenda
- [x] Agendamento de novos horários
- [x] Status de agendamentos
- [x] Campo para contato do cliente

### Serviços
- [x] Modelo `Service` com preço e duração
- [x] CRUD completo de serviços
- [x] Interface responsiva para listagem
- [x] Formulário para criação/edição

### Relatórios
- [x] Relatórios por período (dia, semana, mês)
- [x] Filtro por barbeiro (admin)
- [x] Gráficos para visualização de dados
- [x] Resumo de totais e contagens

### UI/UX
- [x] Design responsivo com Tailwind CSS
- [x] Tema escuro consistente
- [x] Componente de loading (Spinner)
- [x] Mensagens de feedback com toast
- [x] Tratamento de "empty states"
- [x] Layout moderno e intuitivo para a página de Agenda
- [x] Indicadores visuais de status por cores

---

## 🐛 Bugs Corrigidos
- [x] Correção de importações no backend
- [x] Resolução dos problemas de CORS
- [x] Correção no modelo `Appointment` (scheduled_datetime → date_time)
- [x] Correção nos endpoints da API
- [x] Alinhamento de interfaces TypeScript com modelos do backend
- [x] Correção na resposta de autenticação
- [x] Tratamento de erros consistente no frontend
- [x] Melhorias de contraste na página de Agenda
- [x] Scripts automáticos para manutenção e correção do banco

---

## 🚀 Próximos Passos
1. Implementar testes automatizados
2. Melhorar a documentação do código
3. Adicionar funcionalidade de exportação de relatórios
4. Implementar sistema de notificações
5. Otimizar o carregamento da aplicação
6. Melhorar a segurança do sistema
7. Estender o novo layout para as outras páginas do sistema

---

# ✅ TODO - Sistema Interno Fox Barbearia

Lista de tarefas organizadas para o desenvolvimento do sistema Fox Barbearia.

---

## 📦 Estrutura Geral

- [x] Criar projeto React para frontend
- [x] Criar projeto Flask ou FastAPI para backend
- [x] Configurar banco de dados no Supabase
- [x] Configurar conexão segura do backend com Supabase
- [x] Separar Frontend e Backend em pastas distintas (`/frontend`, `/backend`)

---

## 🔐 Autenticação de Usuário

- [x] Criar sistema de login
  - Campo de senha
  - Login por tipo de usuário (`admin` ou `barbeiro`)
- [x] Tela de login simples e responsiva
- [x] Sessão armazenada até logout manual

---

## 👤 Controle de Usuários

- [x] Criar tabela `usuarios` no Supabase
- [x] Tipos de usuário:
  - `admin`: acesso total
  - `barbeiro`: acesso apenas aos próprios dados
- [x] Permitir cadastro manual de novos usuários apenas para `admin`
- [x] Criar tela de cadastro de novos usuários

---

## 📋 Cadastro de Atendimento

- [ ] Tela de novo atendimento:
  - Selecionar serviço
  - Valor original (sugestão automática do serviço)
  - Campo de desconto (opcional)
  - Cálculo automático do valor final
  - Selecionar forma de pagamento (Pix, Cartão, Dinheiro)
- [ ] Registro automático da data e hora
- [ ] Atendimentos associados automaticamente ao usuário logado

---

## 🗓️ Agenda de Horários

- [ ] Tela de agenda semanal
- [ ] Permitir agendar novo horário
- [ ] Permitir alterar status do agendamento (`agendado`, `concluído`, `cancelado`)
- [ ] Filtro por barbeiro e data

---

## 📊 Dashboard Inicial

- [x] Tela de dashboard após login
  - [x] Total de atendimentos do dia
  - [x] Total faturado do dia
  - [x] Gráfico simples de evolução semanal
- [x] Mostrar dados do usuário logado (ou geral para admin)

---

## 📈 Relatórios de Atendimentos

- [x] Tela de relatórios:
  - Filtro por período (dia, semana, mês)
  - Filtro por barbeiro (admin apenas)
- [x] Mostrar:
  - Quantidade de atendimentos
  - Valor total bruto
  - Valor total de descontos aplicados
  - Valor final faturado

---

## 🏦 Controle de Caixa Diário

- [x] Tela de caixa do dia
- [x] Soma por forma de pagamento (Pix, Cartão, Dinheiro)
- [x] Mostrar diferença entre valor bruto e valor com desconto
- [ ] (Opção) Exportar caixa diário em CSV/PDF (opcional para fase 2)

---

## 🎨 Design e Identidade Visual

- [x] Aplicar paleta de cores:
  - Fundo preto ou cinza escuro
  - Botões principais laranja forte (#FFA500)
  - Textos brancos
  - Destaques amarelo (#FFD700)
- [x] Responsividade Mobile First
- [x] Adicionar logo da Fox Barbearia no cabeçalho do sistema

---

## 📚 Organização do Código

- [x] Utilizar boas práticas de desenvolvimento
- [x] Comentar trechos importantes
- [x] Padronizar nomes de tabelas e campos em inglês (ex: `attendances`, `appointments`, `users`, etc.)
- [x] Manter organização de pastas:
  - `/frontend`
  - `/backend`
  - `/docs`

---

# 🚀 Observações Gerais

- Comissão será paga manualmente, baseando-se nos relatórios de atendimentos registrados.
- Atendimento que não for registrado no sistema não entra nos pagamentos diários.
- Não implementar controle automático de comissão neste MVP.

---
