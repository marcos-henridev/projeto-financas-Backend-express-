# API de Finanças

API backend para uma aplicação de finanças pessoais, construída com Node.js,
TypeScript, Express e PostgreSQL. O projeto já expõe autenticação, dados do
usuário e gerenciamento de contas por rotas HTTP.

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

   O servidor escuta na porta `3000`. Para verificar o cadastro, envie uma
   requisição para `http://localhost:3000/auth/register`.

## Rotas disponíveis

O servidor está com as rotas abaixo registradas no `src/server.ts`. Todas as
rotas de `/users` e `/account` exigem autenticação do middleware
`validation`.

| Método   | Caminho          | Descrição                                         |
| -------- | ---------------- | ------------------------------------------------- |
| `POST`   | `/auth/register` | Cadastra um novo usuário                          |
| `POST`   | `/auth/login`    | Realiza login do usuário                          |
| `GET`    | `/users/me`      | Retorna os dados do usuário autenticado           |
| `PATCH`  | `/users/me`      | Atualiza dados do usuário autenticado             |
| `DELETE` | `/users/me`      | Desativa/soft delete do usuário autenticado       |
| `GET`    | `/account`       | Lista contas do usuário autenticado               |
| `POST`   | `/account`       | Cria uma nova conta para o usuário autenticado    |
| `GET`    | `/account/:id`   | Busca uma conta específica do usuário autenticado |
| `PATCH`  | `/account/:id`   | Atualiza uma conta específica                     |
| `DELETE` | `/account/:id`   | Remove uma conta específica                       |

### `POST /auth/register`

Corpo esperado:

```json
{
  "name": "Maria da Silva",
  "email": "maria@example.com",
  "passaword": "uma-senha-segura"
}
```

### `POST /auth/login`

Corpo esperado:

```json
{
  "email": "maria@example.com",
  "passaword": "uma-senha-segura"
}
```

### `GET /users/me` / `PATCH /users/me` / `DELETE /users/me`

Rotas protegidas, acessíveis somente com token JWT válido enviado no header de
autorização do usuário.

### `GET /account` / `POST /account`

Rotas protegidas para listagem e criação de contas:

```json
{
  "name": "Conta Corrente",
  "kind": "checking",
  "initial_balance": 1500.5
}
```

### `GET /account/:id` / `PATCH /account/:id` / `DELETE /account/:id`

Rotas protegidas para leitura, atualização e exclusão da conta por `id`.

## Estrutura de pastas

```text
.
├── prisma/
│   └── schema.prisma                     # Modelos e enums do banco
├── src/
│   ├── midllewares/
│   │   └── auth.midleware.ts            # Validação de token JWT
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts           # Rotas de autenticação
│   │   │   ├── auth.controller.ts       # Entrada HTTP e respostas
│   │   │   ├── auth.service.ts          # Regras de cadastro e login
│   │   │   └── auth.repository.ts       # Consultas e gravações via Prisma
│   │   ├── user/
│   │   │   ├── user.router.ts           # Rotas do perfil do usuário
│   │   │   ├── user.controller.ts       # Lógica HTTP do usuário
│   │   │   ├── user.service.ts          # Regras de negócio do usuário
│   │   │   └── user.repository.ts       # Consultas via Prisma
│   │   └── accounts/
│   │       ├── accounts.router.ts      # Rotas de contas
│   │       ├── accounts.controller.ts   # Lógica HTTP de contas
│   │       ├── accounts.service.ts      # Regras de negócio das contas
│   │       └── accounts.repository.ts  # Consultas via Prisma
│   ├── prisma.ts                       # Cliente Prisma e adapter PostgreSQL
│   └── server.ts                       # Configuração e inicialização do Express
├── prisma7.config.ts                   # Configuração do Prisma CLI
├── tsconfig.json                       # Configuração do TypeScript
├── package.json                        # Dependências e scripts npm
└── .env                                # Configuração local (não versionada)
```

O schema define usuários, contas, categorias, transações e categorias de
transação. O backend atual expõe autenticação, dados do usuário e gerenciamento
de contas por rotas HTTP.

## Scripts npm

| Comando            | Descrição                                                  |
| ------------------ | ---------------------------------------------------------- |
| `npm run dev`      | Inicia o servidor com `tsx` e reinicia ao alterar arquivos |
| `npm run formater` | Formata os arquivos com Prettier                           |
