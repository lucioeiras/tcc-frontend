# tcc-backend

## Subir Containers

```bash
docker-compose up -d
```

## Instalar dependências
```bash
npm ci
```

## Gerar Prisma client
```bash
npx prisma generate
```

## Rodar database migrations
```bash
npx prisma migrate deploy
```


## Configure o arquivo .env local
Ex:
```bash
# Banco de Dados
DB_USER=financeiro_user
DB_PASSWORD=senha_segura
DB_NAME=financeiro_db

# Opcional para pgAdmin
PGADMIN_EMAIL=seu_email@exemplo.com
PGADMIN_PASSWORD=admin123

# URL de conexão para o Prisma (será usada no schema)
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public"
```
