# FinancialAI Server (C14 - L1) - Backend

Projeto backend em Node.js/Express e PostgreSQL para a disciplina C14 - L1 (Engenharia de Software). Inclui autenticação JWT, validação de entrada, proteção com Helmet/CORS/rate limit e integração com Prisma.

## 📁 Estrutura do repositório

- `server.js` - ponto de entrada que inicia o servidor em `process.env.PORT || 3000`
- `src/app.js` - configuração Express + middlewares + rotas
- `src/routes/authRoutes.js` - rotas auth (register + login)
- `src/controllers/authController.js` - lógica de autenticação (bcrypt, JWT, Prisma)
- `src/middlewares/authMiddleware.js` - validação do token JWT
- `src/config/prisma.js` - Prisma Client exportado
- `src/tests` - setup e testes de integração com Jest/Supertest
- `prisma/schema.prisma` - modelo do banco e datasource PostgreSQL
- `docker-compose.yml` - serviço app + postgres
- `Jenkinsfile` - pipeline Build+Test com Docker Compose e credentials
- `docker-compose.jenkins.yml` - ambiente Jenkins para CI

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

