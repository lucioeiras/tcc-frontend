// tests/transactions.test.js
const request = require('supertest');
const app = require('../src/app');
const { prisma } = require('../src/config/prisma');
const bcrypt = require('bcrypt');

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
});

beforeEach(async () => {
  await prisma.$transaction([
    prisma.transaction.deleteMany(),
    prisma.category.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany()
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Transaction Routes', () => {
  const baseUrl = '/api/transactions';

  const createUserAndLogin = async () => {
    const password = 'senha123';
    const hash = await bcrypt.hash(password, 4);

    await prisma.user.create({
      data: {
        email: 'user@example.com',
        passwordHash: hash,
        name: 'User',
        preferences: { create: {} }
      }
    });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password })
      .expect(200);

    return login.body.token;
  };

  const setupBaseData = async () => {
    const user = await prisma.user.findFirst();

    const account = await prisma.account.create({
      data: {
        userId: user.id,
        name: 'Conta',
        type: 'BANK',
        balance: 1000,
        initialBalance: 1000
      }
    });

    const category = await prisma.category.create({
      data: {
        userId: user.id,
        name: 'Categoria',
        type: 'EXPENSE'
      }
    });

    return { user, account, category };
  };

  describe('POST /transactions', () => {
    it('deve criar INCOME e incrementar saldo', async () => {
      const token = await createUserAndLogin();
      const { account } = await setupBaseData();

      await request(app)
        .post(baseUrl)
        .set('Authorization', `Bearer ${token}`)
        .send({ accountId: account.id, amount: 100, type: 'INCOME' })
        .expect(201);

      const updated = await prisma.account.findUnique({ where: { id: account.id } });
      expect(updated.balance).toBe(1100);
    });

    it('deve criar EXPENSE e decrementar saldo', async () => {
      const token = await createUserAndLogin();
      const { account } = await setupBaseData();

      await request(app)
        .post(baseUrl)
        .set('Authorization', `Bearer ${token}`)
        .send({ accountId: account.id, amount: 100, type: 'EXPENSE' })
        .expect(201);

      const updated = await prisma.account.findUnique({ where: { id: account.id } });
      expect(updated.balance).toBe(900);
    });

    it('deve aceitar categoria opcional', async () => {
      const token = await createUserAndLogin();
      const { account, category } = await setupBaseData();

      const res = await request(app)
        .post(baseUrl)
        .set('Authorization', `Bearer ${token}`)
        .send({ accountId: account.id, amount: 50, type: 'EXPENSE', categoryId: category.id })
        .expect(201);

      expect(res.body.transaction.categoryId).toBe(category.id);
    });

    it('deve rejeitar dados inválidos', async () => {
      const token = await createUserAndLogin();

      await request(app)
        .post(baseUrl)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: -100 })
        .expect(400);
    });
  });

  describe('GET /transactions', () => {
    it('deve listar transações do usuário', async () => {
      const token = await createUserAndLogin();
      const { user, account } = await setupBaseData();

      await prisma.transaction.create({
        data: {
          userId: user.id,
          accountId: account.id,
          type: 'INCOME',
          amount: 100,
          transactionDate: new Date()
        }
      });

      const res = await request(app)
        .get(baseUrl)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('deve isolar transações por usuário', async () => {
      const token = await createUserAndLogin();
      const { user, account } = await setupBaseData();

      await prisma.transaction.create({
        data: {
          userId: user.id,
          accountId: account.id,
          type: 'INCOME',
          amount: 100,
          transactionDate: new Date()
        }
      });

      const other = await prisma.user.create({
        data: {
          email: 'other@example.com',
          passwordHash: await bcrypt.hash('123', 4),
          name: 'Other',
          preferences: { create: {} }
        }
      });

      const res = await request(app)
        .get(baseUrl)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.every(t => t.userId === user.id)).toBe(true);
    });
  });

  describe('PUT /transactions/:id', () => {
    it('deve atualizar valor e ajustar saldo', async () => {
      const token = await createUserAndLogin();
      const { user, account } = await setupBaseData();

      const transaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          accountId: account.id,
          type: 'EXPENSE',
          amount: 50,
          transactionDate: new Date()
        }
      });

      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
            accountId: account.id,
            amount: 100,
            type: 'EXPENSE'
        });

      const updated = await prisma.account.findUnique({ where: { id: account.id } });
      expect(updated.balance).toBe(900);
    });

    it('deve rejeitar dados inválidos', async () => {
      const token = await createUserAndLogin();
      const { user, account } = await setupBaseData();

      const transaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          accountId: account.id,
          type: 'INCOME',
          amount: 50,
          transactionDate: new Date()
        }
      });

      await request(app)
        .put(`${baseUrl}/${transaction.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: -100 })
        .expect(400);
    });
  });

  describe('DELETE /transactions/:id', () => {
    it('deve deletar e reverter saldo', async () => {
      const token = await createUserAndLogin();
      const { user, account } = await setupBaseData();

      const transaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          accountId: account.id,
          type: 'EXPENSE',
          amount: 50,
          transactionDate: new Date()
        }
      });

      await request(app)
        .delete(`${baseUrl}/${transaction.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const updated = await prisma.account.findUnique({ where: { id: account.id } });
      expect(updated.balance).toBe(1050);
    });
  });
});