#!/bin/sh
set -e

echo "========================================"
echo "Iniciando container do backend..."
echo "Aplicando migrações do Prisma (se existirem)..."

# Garante que o Prisma Client esteja gerado
npx prisma generate

# Aplica as migrações pendentes (equivalente a prisma migrate deploy)
npx prisma migrate deploy --schema=./prisma/schema.prisma

echo "Migrações aplicadas com sucesso (ou não havia migrações pendentes)."

echo "Iniciando o servidor Node.js..."
exec node server.js