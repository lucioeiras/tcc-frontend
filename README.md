# tcc-backend

## Instalar dependências básicas
```bash
npm install express dotenv cors helmet morgan compression

npm install -D nodemon typescript @types/node @types/express ts-node
```

## Instalar Prisma
```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

## Configure o arquivo .env
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

## Subir o banco de dados

```bash
docker-compose up -d
```

## Configurar prisma
```bash
npx prisma init
npx prisma migrate dev --name init
```
