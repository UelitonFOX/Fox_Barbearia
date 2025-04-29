# Frontend Fox Barbearia

Frontend desenvolvido em React + TailwindCSS para o sistema interno da Fox Barbearia.

## Tecnologias Utilizadas

- React
- TypeScript
- TailwindCSS 
- React Router DOM
- Axios para requisições HTTP
- Supabase SDK (opcional)

## Configuração do Ambiente

1. Instalar dependências:
```
npm install
```

2. Configurar variáveis de ambiente:
   - Crie um arquivo `.env.local` baseado no `.env.example`
   - Configure a URL da API

## Rodando em Desenvolvimento

```
npm run dev
```

O frontend estará disponível em: http://localhost:5173

## Estrutura do Projeto

- `src/`: Código fonte
  - `assets/`: Imagens, fontes e outros recursos
  - `components/`: Componentes reutilizáveis
  - `pages/`: Páginas da aplicação
  - `services/`: Serviços para comunicação com API
  - `utils/`: Funções utilitárias
  - `App.tsx`: Componente principal
  - `main.tsx`: Ponto de entrada
  - `index.css`: Estilos globais com TailwindCSS

## Funcionalidades

### Autenticação
- Login com usuário e senha
- Proteção de rotas

### Dashboard
- Resumo de atendimentos diários
- Gráficos de desempenho

### Cadastros
- Cadastro de atendimentos
- Gerenciamento de agendamentos
- Cadastro de serviços (admin)

### Relatórios
- Relatórios diários/semanais/mensais
- Filtros por período
- Filtros por barbeiro (admin)

### Agenda
- Visualização de agenda por barbeiro
- Agendamento de novos horários

## Design

O design segue a identidade visual da Fox Barbearia:
- Cores principais: Preto/Cinza escuro, Laranja e Amarelo
- Layout responsivo (mobile first)

## Build para Produção

```
npm run build
```

Os arquivos estáticos serão gerados na pasta `dist/`.
