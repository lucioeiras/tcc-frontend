const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Tenta criar um usuário de exemplo
  const user = await prisma.user.create({
    data: {
      email: 'teste@exemplo.com',
      password: 'hash_teste',
      name: 'Usuário Teste',
    },
  });
  console.log('Usuário criado:', user);

  // Lista usuários
  const users = await prisma.user.findMany();
  console.log('Usuários:', users);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });