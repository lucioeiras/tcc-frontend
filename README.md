# FinancialAI Server TCC - Backend

Projeto backend em Node.js/Express com PostgreSQL para TCC. Inclui:
- Autenticação JWT (Registro/Login)
- Criptografia de senha com bcrypt
- Proteção com Helmet, CORS e rate-limit
- Prisma ORM com migrations
- APIs de contas, transações, usuário e chatbot
- Testes de integração com Jest e Supertest
- Docker Compose + Jenkins pipeline

## 📁 Estrutura do repositório

- `server.js` - inicia servidor (a partir de `src/app.js`)
- `src/app.js` - Express app (middlewares, rotas, health check)
- `src/routes/authRoutes.js` - `/api/auth` (register/login)
- `src/routes/userRoutes.js` - `/api/users/me`
- `src/routes/accountRoutes.js` - `/api/accounts`
- `src/routes/transactionRoutes.js` - `/api/transactions`
- `src/routes/chatbotRoutes.js` - `/api/chat/message`
- `src/controllers/authController.js` - lógica de registro/login
- `src/middleware/authMiddleware.js` - validação JWT
- `src/config/prisma.js` - exporta cliente Prisma
- `src/tests/setup.js` - limpeza DB + disconnect
- `src/tests/auth.test.js` - testes de autenticação
- `src/tests/routes.test.js` - testes de rotas API FULL
- `prisma/schema.prisma` - modelo de dados e enums
- `docker-compose.yml` - PostgreSQL + app
- `docker-compose.jenkins.yml` - pipeline Jenkins local
- `Jenkinsfile` - CI Jenkins

## ⚙️ Dependências

- Node.js 18+ compatible
- npm
- Docker + Docker Compose (recomendado)
- Postgres (via Docker ou local)

### npm
- `bcrypt`, `cors`, `dotenv`, `express`, `express-rate-limit`, `express-validator`, `helmet`, `jsonwebtoken`, `prisma`, `@prisma/client`, `pg`
- dev: `jest`, `supertest`, `nodemon`, `ts-node`, `typescript` (as dependências TS são usadas para tooling)

## 🔧 Configuração local

1. `git clone <repo>`
2. `cd tcc-backend`
3. Copie `.env.example` para `.env` (crie se não existir):

```env
PORT=3000
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=financeiro
JWT_SECRET=uma_chave_secreta_forte
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3001
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}
```

4. `npm install`
5. `docker compose up -d`
6. `npx prisma generate`
7. `npx prisma migrate dev --name init`
8. `npm run dev` ou `npm start`

## 🚀 Endpoints disponíveis

- `GET /` : health check
- `GET /api/health` : health check JSON

### Auth
- `POST /api/auth/register`
  - body: `{ email, password, name?, company? }`
- `POST /api/auth/login`
  - body: `{ email, password }`

### Usuário
- `GET /api/users/me` (Bearer token)

### Contas
- `POST /api/accounts` (Bearer token) `{ name, type, initialBalance }`
- `GET /api/accounts` (Bearer token)

### Transações
- `POST /api/transactions` (Bearer token) `{ accountId, amount, type, categoryId?, description? }`
- `GET /api/transactions` (Bearer token)

### Chatbot
- `POST /api/chat/message` (Bearer token) `{ message }`

## 🧪 Testes

- `npm test` -> Jest com `setupFilesAfterEnv` em `src/tests/setup.js`
- `npm run test:watch`
- `npm run test:cov`

### Cobertura de testes atuais
- `src/tests/auth.test.js`:
  - Registro: validade, duplicado, inválido
  - Login: sucesso, senha errada, usuário ausente
- `src/tests/routes.test.js`:
  - health checks, rutas invalidas
  - auth /user/me
  - contas (criar/listar)
  - transações (criar/listar)
  - chatbot (saldo)

## 🐳 Docker

`docker-compose.yml` define:
- `postgres` com ENV `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `app` com `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`

## 🧾 Jenkins

- Pipeline `Jenkinsfile` com stages: build -> test
- Usa `docker compose -f docker-compose.jenkins.yml` para ambiente isolado
- Define credenciais `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`

## ✅ Notas importantes

- Sempre não versionar `.env`
- JWT_SECRET essencial em todos ambientes
- `setup.js` agora usa `TRUNCATE ... CASCADE` para limpar DB corretamente entre testes
- Subir e fechar o Docker antes de rodar testes integrados para estabilidade

## 🛠️ Requisitos

- Node.js (recomendado v18+)
- npm
- Docker + Docker Compose
- PostgreSQL (Docker usa postgres:15-alpine)
- Jenkins (opcional, mas usado no pipeline)

## ⚙️ Configuração local

1. Clonar repositório:
   - `git clone <url>`
   - `cd FinancialAI_server`

2. Criar `.env` na raiz com:

```env
PORT=3000
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=financeiro
JWT_SECRET=uma_chave_secreta_forte
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3001
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}
```

3. Instalar dependências:
   - `npm install`

4. Subir serviços:
   - `docker compose up -d`

5. Gerar cliente Prisma/migration:
   - `npx prisma generate`
   - `npx prisma migrate dev --name init`

6. Rodar local:
   - `npm run dev` (nodemon)
   - ou `npm start`

## 🚀 Endpoints principais

- `GET /` -> status (health check)
- `POST /api/auth/register`
  - body: `{ "email", "password", "name"?, "company"? }`
- `POST /api/auth/login`
  - body: `{ "email", "password" }`

Resposta de sucesso inclui token JWT no formato:

```json
{
  "message": "Login bem-sucedido",
  "user": {"id","email","name","company"},
  "token": "..."
}
```

## 🧪 Testes

- `npm test` (executa `src/tests/test-db.js` + Jest)
- `npm run test:watch` (modo watch)
- `npm run test:cov` (coverage)

Notas:
- `src/tests/setup.js` limpa a tabela `User` antes de cada teste
- `test-db.js` verifica conexão e CRUD básico do Prisma

## 📦 Docker Compose

`docker-compose.yml` define:

- `postgres`:
  - `POSTGRES_USER=$DB_USER`
  - `POSTGRES_PASSWORD=$DB_PASSWORD`
  - `POSTGRES_DB=$DB_NAME`

- `app`:
  - `DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}`
  - `JWT_SECRET=${JWT_SECRET}`
  - `JWT_EXPIRES_IN=${JWT_EXPIRES_IN}`

## 🧾 Jenkins (C14-L1) - variáveis e credenciais

Pipeline em `Jenkinsfile` usa `withCredentials` para ler segredos:

- `DB_USER` (Secret Text)
- `DB_PASSWORD` (Secret Text)
- `DB_NAME` (Secret Text)
- `JWT_SECRET` (Secret Text)
- `JWT_EXPIRES_IN` (Secret Text)

Na interface Jenkins:
1. Configurar acesso ao repositório (recomendo PAT)
1. Manage Jenkins -> Manage Credentials -> (global)
2. Add Credentials -> Secret text -> ID: `DB_USER`, valor: `seu_usuario`
3. Repetir para `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`

No pipeline:
- Build: docker compose build
- Test: sobe `docker compose up -d`, aguarda `pg_isready`, `prisma generate`, `npm test`

### Variáveis adicionais (internas do pipeline)

- `BUILD_PROJECT = build_${BUILD_ID}`
- `TEST_PROJECT = test_${BUILD_ID}`

Essas variáveis isolam o ambiente do Docker Compose para múltiplas execuções.

## 🔐 Segurança

- Não versionar `.env`
- JWT_SECRET obrigatória
- Use senha robusta e rotação periódica (principalmente no Jenkins)

## 💡 Observações

- O banco PostgreSQL e a API ficam na mesma rede Docker (`financeiro-network`)
- Se for rodar local sem Docker, adapte `DATABASE_URL` para `localhost`

---

