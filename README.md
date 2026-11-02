# API de Finanças

API backend para uma aplicação de finanças pessoais, construída com Node.js,
TypeScript, Express e PostgreSQL. O projeto expõe autenticação, dados do
usuário, contas, categorias, transações e um resumo de saldo por rotas HTTP.

## Tecnologias

- **Node.js** e **TypeScript 6**: ambiente de execução e linguagem do projeto.
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
- **GitHub Actions**: CI com checagem de formatação, schema, tipos e
  dependências.

## Requisitos

- Node.js 24 ou superior e npm.
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
   npx prisma migrate dev --name init --config prisma7.config.ts
   npm run prisma:generate
   ```

5. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   O servidor escuta na porta `3000`. Para verificar o cadastro, envie uma
   requisição para `http://localhost:3000/auth/register`.

## Rotas disponíveis

O servidor está com as rotas abaixo registradas no `src/server.ts`. Todas as
rotas, exceto as de `/auth`, exigem um token JWT válido (middleware
`validation`).

| Método   | Caminho                | Descrição                                   |
| -------- | ---------------------- | ------------------------------------------- |
| `POST`   | `/auth/register`       | Cadastra um novo usuário                    |
| `POST`   | `/auth/login`          | Realiza login do usuário                    |
| `GET`    | `/users/me`            | Retorna os dados do usuário autenticado     |
| `PATCH`  | `/users/me`            | Atualiza dados do usuário autenticado       |
| `DELETE` | `/users/me`            | Desativa/soft delete do usuário autenticado |
| `GET`    | `/account`             | Lista contas do usuário                     |
| `POST`   | `/account`             | Cria uma nova conta                         |
| `GET`    | `/account/:id`         | Busca uma conta específica                  |
| `PATCH`  | `/account/:id`         | Atualiza uma conta específica               |
| `DELETE` | `/account/:id`         | Remove uma conta específica                 |
| `GET`    | `/categories`          | Lista categorias do usuário                 |
| `POST`   | `/categories`          | Cria uma nova categoria                     |
| `GET`    | `/categories/:id`      | Busca uma categoria específica              |
| `PATCH`  | `/categories/:id`      | Atualiza nome, cor ou ícone da categoria    |
| `DELETE` | `/categories/:id`      | Soft delete da categoria                    |
| `GET`    | `/transaction`         | Lista transações (com filtros por query)    |
| `POST`   | `/transaction`         | Cria uma receita, despesa ou transferência  |
| `GET`    | `/transaction/:id`     | Busca uma transação específica              |
| `PATCH`  | `/transaction/:id`     | Atualiza descrição, categoria ou vencimento |
| `DELETE` | `/transaction/:id`     | Remove a transação e reverte o saldo        |
| `PATCH`  | `/transaction/:id/pay` | Marca uma transação pendente como paga      |
| `GET`    | `/dashboard/balance`   | Retorna o saldo total das contas ativas     |

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

### `POST /account`

`kind` aceita `corrente`, `poupanca`, `carteira`, `investimento` ou `outro`.

```json
{
  "name": "Conta Corrente",
  "kind": "corrente",
  "initial_balance": 1500.5
}
```

### `POST /categories`

`kind` aceita `receita` ou `despesa`.

```json
{
  "name": "Mercado",
  "kind": "despesa",
  "color": "#FF0000",
  "icon": "cart"
}
```

### `POST /transaction`

`kind` aceita `receita`, `despesa` ou `transferencia`. Receitas e despesas
exigem `category_id`; transferências exigem `destination_account_id`. `status`
é opcional (padrão `pendente`) e `due_date` é opcional (padrão: hoje).

```json
{
  "account_id": "uuid-da-conta",
  "category_id": "uuid-da-categoria",
  "kind": "despesa",
  "description": "Compra do mês",
  "amount": 250.9,
  "due_date": "2026-11-10"
}
```

`GET /transaction` aceita os filtros `account_id`, `kind`, `status`, `from` e
`to` na query string.

## Erros

Os services lançam `AppError` (`src/errors/AppError.ts`) com uma mensagem e um
status HTTP. Os controllers repassam o erro com `next(erro)` e o
`erroMiddleware` responde sempre no mesmo formato:

```json
{
  "status": "error",
  "message": "Account not found"
}
```

Erros que não são `AppError` retornam `500` com `"Internal server error"`.

## Estrutura de pastas

```text
.
├── .github/workflows/ci.yml            # Pipeline de CI
├── prisma/
│   └── schema.prisma                   # Modelos e enums do banco
├── src/
│   ├── errors/
│   │   ├── AppError.ts                 # Erro com status HTTP
│   │   └── erro.middleware.ts          # Middleware global de erros
│   ├── midllewares/
│   │   └── auth.midleware.ts           # Validação de token JWT
│   ├── modules/                        # Cada módulo: router, controller, service, repository
│   │   ├── auth/
│   │   ├── user/
│   │   ├── accounts/
│   │   ├── categories/
│   │   ├── transactions/
│   │   └── dashboard/
│   ├── prisma.ts                       # Cliente Prisma e adapter PostgreSQL
│   └── server.ts                       # Configuração e inicialização do Express
├── prisma7.config.ts                   # Configuração do Prisma CLI
├── tsconfig.json                       # Configuração do TypeScript
├── package.json                        # Dependências e scripts npm
└── .env                                # Configuração local (não versionada)
```

## Scripts npm

| Comando                   | Descrição                                                  |
| ------------------------- | ---------------------------------------------------------- |
| `npm run dev`             | Inicia o servidor com `tsx` e reinicia ao alterar arquivos |
| `npm run formater`        | Formata os arquivos com Prettier                           |
| `npm run format:check`    | Verifica a formatação sem alterar arquivos                 |
| `npm run typecheck`       | Checa os tipos com `tsc --noEmit`                          |
| `npm run prisma:validate` | Valida o `schema.prisma`                                   |
| `npm run prisma:generate` | Gera o Prisma Client em `generated/prisma`                 |
| `npm run ci`              | Roda localmente as mesmas checagens do CI                  |

## CI

O workflow `.github/workflows/ci.yml` roda em todo pull request e em push na
`main`, com dois jobs em paralelo:

- **Format & typecheck**: `format:check`, `prisma:validate`, `prisma:generate`
  e `typecheck`.
- **Dependency audit**: `npm audit` nas dependências de produção (falha em
  vulnerabilidades altas).

Antes de abrir um PR, rode `npm run ci` para pegar os mesmos erros localmente.
