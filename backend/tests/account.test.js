// tests/account.test.js
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
    prisma.account.deleteMany(),
    prisma.user.deleteMany()
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Account Routes', () => {
  const baseUrl = '/api/accounts';

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

  const createAccount = async (userId) => {
    return prisma.account.create({
      data: {
        userId,
        name: 'Conta Teste',
        type: 'BANK',
        balance: 1000,
        initialBalance: 1000
      }
    });
  };

  describe('POST /accounts', () => {
    it('deve criar conta com sucesso', async () => {
      const token = await createUserAndLogin();

      const res = await request(app)
        .post(baseUrl)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Nova Conta', type: 'WALLET', initialBalance: 500 })
        .expect(201);

      expect(res.body.account.name).toBe('Nova Conta');
      expect(res.body.account.balance).toBe(500);
    });

    it('deve usar saldo padrão (0)', async () => {
      const token = await createUserAndLogin();

      const res = await request(app)
        .post(baseUrl)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Conta', type: 'SAVINGS' })
        .expect(201);

      expect(res.body.account.balance).toBe(0);
    });

    it('deve rejeitar dados inválidos', async () => {
      const token = await createUserAndLogin();

      await request(app)
        .post(baseUrl)
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'INVALID' })
        .expect(400);
    });
  });

  describe('GET /accounts', () => {
    it('deve listar contas do usuário', async () => {
      const token = await createUserAndLogin();

      const user = await prisma.user.findFirst();
      await createAccount(user.id);

      const res = await request(app)
        .get(baseUrl)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('deve isolar contas por usuário', async () => {
      const token = await createUserAndLogin();
      const user = await prisma.user.findFirst();

      await createAccount(user.id);

      // outro usuário
      const other = await prisma.user.create({
        data: {
          email: 'other@example.com',
          passwordHash: await bcrypt.hash('123', 4),
          name: 'Other',
          preferences: { create: {} }
        }
      });

      await createAccount(other.id);

      const res = await request(app)
        .get(baseUrl)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.every(a => a.userId === user.id)).toBe(true);
    });
  });

  describe('GET /accounts/:id', () => {
    it('deve retornar conta específica', async () => {
      const token = await createUserAndLogin();
      const user = await prisma.user.findFirst();
      const account = await createAccount(user.id);

      const res = await request(app)
        .get(`${baseUrl}/${account.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.id).toBe(account.id);
    });

    it('deve retornar 404 para conta inexistente', async () => {
      const token = await createUserAndLogin();

      await request(app)
        .get(`${baseUrl}/fake-id`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });
  });

  describe('PUT /accounts/:id', () => {
    it('deve atualizar conta', async () => {
      const token = await createUserAndLogin();
      const user = await prisma.user.findFirst();
      const account = await createAccount(user.id);

      const res = await request(app)
        .put(`${baseUrl}/${account.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Atualizada' })
        .expect(200);

      expect(res.body.account.name).toBe('Atualizada');
    });

    it('deve rejeitar dados inválidos', async () => {
      const token = await createUserAndLogin();
      const user = await prisma.user.findFirst();
      const account = await createAccount(user.id);

      await request(app)
        .put(`${baseUrl}/${account.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'INVALID' })
        .expect(400);
    });
  });

  describe('DELETE /accounts/:id', () => {
    it('deve deletar conta sem transações', async () => {
      const token = await createUserAndLogin();
      const user = await prisma.user.findFirst();
      const account = await createAccount(user.id);

      await request(app)
        .delete(`${baseUrl}/${account.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const deleted = await prisma.account.findUnique({ where: { id: account.id } });
      expect(deleted).toBeNull();
    });

    it('deve impedir deleção com transações', async () => {
      const token = await createUserAndLogin();
      const user = await prisma.user.findFirst();
      const account = await createAccount(user.id);

      await prisma.transaction.create({
        data: {
          userId: user.id,
          accountId: account.id,
          type: 'INCOME',
          amount: 100,
          transactionDate: new Date()
        }
      });

      await request(app)
        .delete(`${baseUrl}/${account.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });
  });
});
