// src/tests/setup.js
const { prisma } = require('../config/prisma');

beforeEach(async () => {
  try {
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.alert.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();
    await prisma.category.deleteMany();
    await prisma.userPreference.deleteMany();
    await prisma.user.deleteMany();
  } catch (err) {
    console.warn('Erro ao limpar banco de testes:', err);
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});