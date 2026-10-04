# API de Finanças

API backend para uma aplicação de finanças pessoais, construída com Node.js,
TypeScript, Express e PostgreSQL. Atualmente, o endpoint HTTP implementado é o
de cadastro de usuário; as demais entidades do banco já estão descritas no
schema do Prisma, mas ainda não têm rotas.

## Tecnologias

- **Node.js** e **TypeScript**: ambiente de execução e linguagem do projeto.
- **Express 5**: servidor HTTP e roteamento.
- **PostgreSQL**: banco de dados relacional.
- **Prisma 7** (`prisma` e `@prisma/client`): schema e acesso ao banco.
- **Prisma Pg Adapter** (`@prisma/adapter-pg`) e **node-postgres** (`pg`):
  conexão do Prisma com PostgreSQL.
- **bcrypt**: geração de hash de senha.
- **jsonwebtoken**: geração de tokens JWT no serviço de autenticação.
- **dotenv**: leitura das variáveis do arquivo `.env`.
- **tsx**: execução do TypeScript em desenvolvimento, com reinicialização ao
  detectar alterações.
- **Prettier**: formatação do código.

## Requisitos

- Node.js 18 ou superior e npm.
- Uma instância PostgreSQL acessível.
- A extensão `citext` habilitada no banco, usada pelo campo de e-mail do schema.

## Como iniciar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um arquivo `.env` na raiz do projeto:

   ```env
   DATABASE_URL="postgresql://USUARIO:SENHA@HOST:5432/NOME_DO_BANCO"
   JWT_SECRET="uma-chave-secreta-longa"
   ```

   Substitua os valores pelos dados do seu PostgreSQL. Não compartilhe nem
   envie o arquivo `.env` para o controle de versão.

3. Habilite `citext` no banco, caso ainda não esteja habilitada:

   ```sql
   CREATE EXTENSION IF NOT EXISTS citext;
   ```

4. Crie e aplique a migração inicial e gere o Prisma Client:

   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   O servidor escuta na porta `3333`. Para verificar o cadastro, envie uma
   requisição para `http://localhost:3333/auth/register`.

## Rotas disponíveis

| Método | Caminho          | Descrição           |
| ------ | ---------------- | ------------------- |
| `POST` | `/auth/register` | Cadastra um usuário |

### `POST /auth/register`

Corpo JSON esperado pela implementação atual:

```json
{
  "name": "Maria da Silva",
  "email": "maria@example.com",
  "passaword": "uma-senha-segura"
}
```

> **Atenção:** o campo está escrito `passaword` no código atual. Use essa
> grafia na requisição até que o nome seja corrigido na API.

Em caso de sucesso, a rota responde com status `201` e os dados do usuário,
sem o hash da senha. Erros são tratados pelo controller e respondem com status
`500`; no momento, isso inclui também a tentativa de cadastrar um e-mail já
existente.

O serviço contém lógica de login, mas ainda não há controller/rota HTTP de
login registrada.

## Estrutura de pastas

```text
.
├── prisma/
│   └── schema.prisma              # Modelos e enums do banco
├── src/
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.routes.ts     # Rotas de autenticação
│   │       ├── auth.controller.ts# Entrada HTTP e respostas
│   │       ├── auth.service.ts   # Regras de cadastro e login
│   │       └── auth.repository.ts# Consultas e gravações via Prisma
│   ├── prisma.ts                  # Cliente Prisma e adapter PostgreSQL
│   └── server.ts                  # Configuração e inicialização do Express
├── prisma7.config.ts              # Configuração do Prisma CLI
├── tsconfig.json                  # Configuração do TypeScript
├── package.json                   # Dependências e scripts npm
└── .env                           # Configuração local (não versionada)
```

O schema define usuários, contas, categorias, transações e categorias de
transação. Até o momento, apenas o cadastro de usuários está exposto por uma
rota HTTP.

## Scripts npm

| Comando            | Descrição                                                  |
| ------------------ | ---------------------------------------------------------- |
| `npm run dev`      | Inicia o servidor com `tsx` e reinicia ao alterar arquivos |
| `npm run formater` | Formata os arquivos com Prettier                           |
