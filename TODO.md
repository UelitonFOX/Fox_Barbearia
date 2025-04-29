# 🦊 Fox Barbearia - Lista de Tarefas

## 🚀 Funcionalidades a Implementar

### Prioridade Alta
- [ ] Implementar CRUD completo de Serviços
- [ ] Implementar Cadastro de Atendimentos com desconto opcional
- [ ] Implementar Dashboard com resumo diário
- [ ] Implementar Controle de Caixa Diário

### Prioridade Média
- [ ] Implementar Agenda de Agendamentos
- [ ] Implementar Relatório de Atendimentos
- [ ] Implementar Gestão de Usuários (Barbeiros)
- [ ] Melhorar UI/UX das telas principais 

### Prioridade Baixa
- [ ] Adicionar tema escuro/claro
- [ ] Implementar recuperação de senha
- [ ] Implementar notificações para agendamentos
- [ ] Implementar exportação de relatórios em PDF

## 🐛 Bugs e Correções
- [ ] Corrigir erro de redirecionamento após login
- [ ] Otimizar carregamento inicial da aplicação
- [ ] Melhorar validação de formulários
- [ ] Garantir responsividade em telas menores

## 🔧 Melhorias Técnicas
- [ ] Adicionar testes unitários no backend
- [ ] Adicionar testes E2E no frontend
- [ ] Implementar CI/CD para deploy automático
- [ ] Melhorar documentação da API
- [ ] Otimizar consultas ao banco de dados

---

# ✅ TODO - Sistema Interno Fox Barbearia

Lista de tarefas organizadas para o desenvolvimento do sistema Fox Barbearia.

---

## 📦 Estrutura Geral

- [x] Criar projeto React para frontend
- [x] Criar projeto Flask ou FastAPI para backend
- [ ] Configurar banco de dados no Supabase
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
- [ ] Criar tela de cadastro de novos usuários (opcional para MVP)

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

- [ ] Tela de dashboard após login
  - Total de atendimentos do dia
  - Total faturado do dia
  - Gráfico simples de evolução semanal
- [ ] Mostrar dados do usuário logado (ou geral para admin)

---

## 📈 Relatórios de Atendimentos

- [ ] Tela de relatórios:
  - Filtro por período (dia, semana, mês)
  - Filtro por barbeiro (admin apenas)
- [ ] Mostrar:
  - Quantidade de atendimentos
  - Valor total bruto
  - Valor total de descontos aplicados
  - Valor final faturado

---

## 🏦 Controle de Caixa Diário

- [ ] Tela de caixa do dia
- [ ] Soma por forma de pagamento (Pix, Cartão, Dinheiro)
- [ ] Mostrar diferença entre valor bruto e valor com desconto
- [ ] (Opção) Exportar caixa diário em CSV/PDF (opcional para fase 2)

---

## 🎨 Design e Identidade Visual

- [ ] Aplicar paleta de cores:
  - Fundo preto ou cinza escuro
  - Botões principais laranja forte (#FFA500)
  - Textos brancos
  - Destaques amarelo (#FFD700)
- [ ] Responsividade Mobile First
- [ ] Adicionar logo da Fox Barbearia no cabeçalho do sistema

---

## 📚 Organização do Código

- [ ] Utilizar boas práticas de desenvolvimento
- [ ] Comentar trechos importantes
- [ ] Padronizar nomes de tabelas e campos em inglês (ex: `attendances`, `appointments`, `users`, etc.)
- [ ] Manter organização de pastas:
  - `/frontend`
  - `/backend`
  - `/docs`

---

# 🚀 Observações Gerais

- Comissão será paga manualmente, baseando-se nos relatórios de atendimentos registrados.
- Atendimento que não for registrado no sistema não entra nos pagamentos diários.
- Não implementar controle automático de comissão neste MVP.

---
