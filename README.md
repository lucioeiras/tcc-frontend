# tcc-backend

## Rodar Jenkins local

```bash
docker compose -f docker-compose.jenkins.yml up -d --build

```

## Subir Containers

```bash
docker-compose up -d
```

## Caso docker-entrypoint.sh não for reconhecido

```bash
dos2unix docker-entrypoint.sh
```

## Ambiente Local
### Instalar dependências
```bash
npm ci
```

### Gerar Prisma client
```bash
npx prisma generate
```

### Rodar database migrations
```bash
npx prisma migrate deploy
```


### Configure o arquivo .env local
Ex:
```bash
# Banco de Dados
DB_USER=financeiro_user
DB_PASSWORD=senha_segura
DB_NAME=financeiro_db

DATABASE_URL="postgresql://financeiro_user:senha_segura@localhost:5432/financeiro_db"

JWT_SECRET="MinhaChaveSecretaSuperSegura"
JWT_EXPIRES_IN="7d"
PORT=3000
```
