# API de Finanças

API backend para uma aplicação de finanças pessoais, construída com Node.js,
TypeScript, Express e PostgreSQL. O projeto expõe autenticação, dados do
usuário, contas, categorias, transações e um dashboard (saldo, resumo por
período, pendências e gastos por categoria) por rotas HTTP.

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
- **helmet**: headers HTTP de segurança.
- **express-rate-limit**: limite de tentativas nas rotas de login e cadastro.
- **CORS próprio** (`src/midllewares/cors.middleware.ts`): libera apenas as
  origens configuradas em `CORS_ORIGINS_ALLOW`.
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
   CORS_ORIGINS_ALLOW="http://localhost:3001,http://localhost:5173"
   PORT=3000
   ```

   | Variável             | Obrigatória | Descrição                                                                           |
   | -------------------- | ----------- | ----------------------------------------------------------------------------------- |
   | `DATABASE_URL`       | Sim         | URL de conexão do PostgreSQL                                                        |
   | `JWT_SECRET`         | Sim         | Chave usada para assinar e validar os tokens JWT                                    |
   | `CORS_ORIGINS_ALLOW` | Não         | Origens liberadas no CORS, separadas por vírgula (padrão `http://localhost:3000`)   |
   | `PORT`               | Não         | Porta do servidor (padrão `3000`; em produção a hospedagem costuma definir sozinha) |

   Substitua os valores pelos dados do seu ambiente. Não compartilhe nem
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

   O servidor escuta na porta definida em `PORT` (padrão `3000`). Para
   verificar o cadastro, envie uma requisição para
   `http://localhost:3000/auth/register`.

## Rotas disponíveis

O servidor está com as rotas abaixo registradas no `src/server.ts`. Todas as
rotas, exceto as de `/auth`, exigem um token JWT válido (middleware
`validation`).

| Método   | Caminho                 | Descrição                                   |
| -------- | ----------------------- | ------------------------------------------- |
| `POST`   | `/auth/register`        | Cadastra um novo usuário                    |
| `POST`   | `/auth/login`           | Realiza login do usuário                    |
| `GET`    | `/users/me`             | Retorna os dados do usuário autenticado     |
| `PATCH`  | `/users/me`             | Atualiza dados do usuário autenticado       |
| `DELETE` | `/users/me`             | Desativa/soft delete do usuário autenticado |
| `GET`    | `/account`              | Lista contas do usuário                     |
| `POST`   | `/account`              | Cria uma nova conta                         |
| `GET`    | `/account/:id`          | Busca uma conta específica                  |
| `PATCH`  | `/account/:id`          | Atualiza uma conta específica               |
| `DELETE` | `/account/:id`          | Remove uma conta específica                 |
| `GET`    | `/categories`           | Lista categorias do usuário                 |
| `POST`   | `/categories`           | Cria uma nova categoria                     |
| `GET`    | `/categories/:id`       | Busca uma categoria específica              |
| `PATCH`  | `/categories/:id`       | Atualiza nome, cor ou ícone da categoria    |
| `DELETE` | `/categories/:id`       | Soft delete da categoria                    |
| `GET`    | `/transaction`          | Lista transações (com filtros por query)    |
| `POST`   | `/transaction`          | Cria uma receita, despesa ou transferência  |
| `GET`    | `/transaction/:id`      | Busca uma transação específica              |
| `PATCH`  | `/transaction/:id`      | Atualiza descrição, categoria ou vencimento |
| `DELETE` | `/transaction/:id`      | Remove a transação e reverte o saldo        |
| `PATCH`  | `/transaction/:id/pay`  | Marca uma transação pendente como paga      |
| `GET`    | `/dashboard/balance`    | Retorna o saldo total das contas ativas     |
| `GET`    | `/dashboard/sumary`     | Soma receitas e despesas pagas no período   |
| `GET`    | `/dashboard/pendente`   | Lista receitas e despesas pendentes         |
| `GET`    | `/dashboard/categorias` | Gastos pagos por categoria no período       |

## Segurança

Middlewares aplicados em `src/server.ts`, nesta ordem:

1. **helmet**: adiciona headers HTTP de segurança em todas as respostas.
2. **CORS** (`cors.middleware.ts`): requisições sem header `Origin` (curl,
   Postman, servidor a servidor) passam direto. Origens que estão em
   `CORS_ORIGINS_ALLOW` recebem `Access-Control-Allow-Origin`. As demais
   recebem `403`. O preflight `OPTIONS` responde `204` liberando os métodos
   `GET, POST, PATCH, DELETE` e os headers `Content-Type, Authorization`.
3. **validation** (`auth.midleware.ts`): exige `Authorization: Bearer <token>`
   em todas as rotas, exceto `/auth`.

### Rate limit

Definido em `src/midllewares/rate-limit.middleware.ts`, por IP:

| Rota                  | Limite                         | Observação                      |
| --------------------- | ------------------------------ | ------------------------------- |
| `POST /auth/login`    | 5 tentativas a cada 15 minutos | Logins bem-sucedidos não contam |
| `POST /auth/register` | 5 cadastros por hora           |                                 |

Ao passar do limite a API responde `429`, no formato padrão de erro. Os
headers `RateLimit-*` informam quantas tentativas restam.

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

### Dashboard

`GET /dashboard/sumary` e `GET /dashboard/categorias` exigem `from` e `to` na
query, no formato `YYYY-MM-DD`. As datas usam o fuso de São Paulo (`-03:00`),
do início do dia `from` ao fim do dia `to`, e `from` não pode ser maior que
`to`. Só entram transações pagas, pela data de pagamento (`paid_at`).

```text
GET /dashboard/categorias?from=2026-11-01&to=2026-11-30
```

```json
{
  "from": "2026-11-01",
  "to": "2026-11-30",
  "total": 850.5,
  "categorias": [
    {
      "category_id": "uuid-da-categoria",
      "name": "Mercado",
      "color": "#FF0000",
      "icon": "cart",
      "total": 600,
      "quantidade": 4,
      "percentual": 70.55
    }
  ]
}
```

`GET /dashboard/pendente` separa as pendências em `receitas` e `despesas`. Cada
grupo traz o `total` e os itens, e cada item é marcado como `VENCIDO`,
`EM DIA` ou `SEM VENCIMENTO`.

## Erros

Os services lançam `AppError` (`src/errors/AppError.ts`) com uma mensagem e um
status HTTP. Os controllers repassam o erro com `next(erro)` e o
`erroMiddleware` responde sempre no mesmo formato:

```json
{
  "status": "erro",
  "message": "Account not found"
}
```

Erros que não são `AppError` retornam `500` com
`"erro interno do servidor"`. Os middlewares de CORS (`403`) e rate limit
(`429`) usam o mesmo formato.

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
│   │   ├── auth.midleware.ts           # Validação de token JWT
│   │   ├── cors.middleware.ts          # CORS com origens configuráveis
│   │   └── rate-limit.middleware.ts    # Limites de login e cadastro
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
| `npm run build`           | Compila o TypeScript com `tsc`                             |
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

## Deploy

Checklist para subir em produção:

- Configure na hospedagem as variáveis `DATABASE_URL`, `JWT_SECRET` e
  `CORS_ORIGINS_ALLOW` (com a URL do frontend em produção). A `PORT`
  normalmente é definida pela própria hospedagem.
- Rode as migrações no banco de produção:
  `npx prisma migrate deploy --config prisma7.config.ts`.
- Atrás de um proxy (Render, Railway etc.), o rate limit precisa de
  `app.set('trust proxy', 1)` para enxergar o IP real de cada cliente.
- Ainda não há script `start`. O `npm run build` gera os `.js` ao lado dos
  `.ts`, e os imports sem extensão não rodam direto no Node em modo ESM. Por
  enquanto, inicie com `tsx src/server.ts`.
