// src/tests/setup.js
const { prisma } = require('../config/prisma');

beforeEach(async () => {
  try {
    // Limpa apenas a tabela de usuários (ou outras tabelas que você use nos testes)
    await prisma.user.deleteMany({});
  } catch (err) {
    console.warn('Aviso: não foi possível limpar tabela de usuários antes do teste', err);
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});