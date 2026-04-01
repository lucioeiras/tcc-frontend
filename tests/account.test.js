// tests/account.test.js
const request = require('supertest');
const app = require('../src/app');
const { prisma } = require('../src/config/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('Account Routes', () => {
  const baseUrl = '/api/accounts';
  let token;
  let userId;
  let user;
  let account;

  beforeEach(async () => {
    // Criar usuário de teste
    user = await prisma.user.create({
      data: {
        email: `user.${Date.now()}@example.com`,
        passwordHash: await bcrypt.hash('senha123456', 10),
        name: 'Usuário Teste',
        preferences: { create: {} }
      }
    });

    userId = user.id;

    // Gerar token
    token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Criar conta de teste
    account = await prisma.account.create({
      data: {
        userId,
        name: 'Conta Teste',
        type: 'BANK',
        balance: 1000,
        initialBalance: 1000
      }
    });
  });

  describe('POST /accounts', () => {
    it('deve criar uma conta com sucesso', async () => {
      const res = await request(app)
        .post(baseUrl)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Nova Conta',
          type: 'WALLET',
          initialBalance: 500
        })
        .expect(201);

      expect(res.body.message).toBe('Conta criada com sucesso');
      expect(res.body.account.name).toBe('Nova Conta');
      expect(res.body.account.type).toBe('WALLET');
      expect(res.body.account.balance).toBe(500);
      expect(res.body.account.initialBalance).toBe(500);
      expect(res.body.account.userId).toBe(userId);
    });

    it('deve criar conta com saldo inicial padrão (0)', async () => {
      const res = await request(app)
        .post(baseUrl)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Conta Sem Saldo',
          type: 'SAVINGS'
        })
        .expect(201);

      expect(res.body.account.balance).toBe(0);
      expect(res.body.account.initialBalance).toBe(0);
    });

    it('deve rejeitar conta sem nome', async () => {
      const res = await request(app)
        .post(baseUrl)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'BANK',
          initialBalance: 100
        })
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });

    it('deve rejeitar tipo de conta inválido', async () => {
      const res = await request(app)
        .post(baseUrl)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Conta',
          type: 'INVALID_TYPE',
          initialBalance: 100
        })
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });

    it('deve rejeitar saldo inicial negativo', async () => {
      const res = await request(app)
        .post(baseUrl)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Conta',
          type: 'BANK',
          initialBalance: -100
        })
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });

    it('deve retornar 401 sem token', async () => {
      await request(app)
        .post(baseUrl)
        .send({
          name: 'Conta',
          type: 'BANK'
        })
        .expect(401);
    });
  });

  describe('GET /accounts', () => {
    it('deve listar todas as contas do usuário', async () => {
      const res = await request(app)
        .get(baseUrl)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body.some(a => a.id === account.id)).toBe(true);
    });

    it('deve retornar apenas contas do usuário autenticado', async () => {
      // Criar outro usuário com conta
      const otherUser = await prisma.user.create({
        data: {
          email: `other.${Date.now()}@example.com`,
          passwordHash: await bcrypt.hash('senha123456', 10),
          name: 'Outro Usuário',
          preferences: { create: {} }
        }
      });

      await prisma.account.create({
        data: {
          userId: otherUser.id,
          name: 'Conta Outro',
          type: 'BANK'
        }
      });

      const res = await request(app)
        .get(baseUrl)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.every(a => a.userId === userId)).toBe(true);
    });

    it('deve retornar 401 sem token', async () => {
      await request(app)
        .get(baseUrl)
        .expect(401);
    });

    it('deve incluir transações em cada conta', async () => {
      const res = await request(app)
        .get(baseUrl)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body[0].transactions).toBeDefined();
      expect(Array.isArray(res.body[0].transactions)).toBe(true);
    });
  });

  describe('GET /accounts/:id', () => {
    it('deve retornar conta específica', async () => {
      const res = await request(app)
        .get(`${baseUrl}/${account.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.id).toBe(account.id);
      expect(res.body.name).toBe(account.name);
      expect(res.body.userId).toBe(userId);
      expect(res.body.transactions).toBeDefined();
    });

    it('deve retornar 404 se conta não existe', async () => {
      const fakeId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

      const res = await request(app)
        .get(`${baseUrl}/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.error).toBe('Conta não encontrada');
    });

    it('deve retornar 404 se conta pertence a outro usuário', async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: `other2.${Date.now()}@example.com`,
          passwordHash: await bcrypt.hash('senha123456', 10),
          name: 'Outro Usuário',
          preferences: { create: {} }
        }
      });

      const otherAccount = await prisma.account.create({
        data: {
          userId: otherUser.id,
          name: 'Conta Outro',
          type: 'BANK'
        }
      });

      const res = await request(app)
        .get(`${baseUrl}/${otherAccount.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.error).toBe('Conta não encontrada');
    });

    it('deve rejeitar ID inválido', async () => {
      const res = await request(app)
        .get(`${baseUrl}/id-invalido`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });

    it('deve retornar 401 sem token', async () => {
      await request(app)
        .get(`${baseUrl}/${account.id}`)
        .expect(401);
    });
  });

  describe('PUT /accounts/:id', () => {
    it('deve atualizar nome da conta', async () => {
      const res = await request(app)
        .put(`${baseUrl}/${account.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Conta Atualizada'
        })
        .expect(200);

      expect(res.body.message).toBe('Conta atualizada com sucesso');
      expect(res.body.account.name).toBe('Conta Atualizada');
    });

    it('deve atualizar tipo da conta', async () => {
      const res = await request(app)
        .put(`${baseUrl}/${account.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'CREDIT_CARD'
        })
        .expect(200);

      expect(res.body.account.type).toBe('CREDIT_CARD');
    });

    it('deve atualizar status da conta', async () => {
      const res = await request(app)
        .put(`${baseUrl}/${account.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: false
        })
        .expect(200);

      expect(res.body.account.status).toBe(false);
    });

    it('deve atualizar múltiplos campos', async () => {
      const res = await request(app)
        .put(`${baseUrl}/${account.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Nova Conta',
          type: 'SAVINGS',
          status: false
        })
        .expect(200);

      expect(res.body.account.name).toBe('Nova Conta');
      expect(res.body.account.type).toBe('SAVINGS');
      expect(res.body.account.status).toBe(false);
    });

    it('deve rejeitar tipo inválido', async () => {
      const res = await request(app)
        .put(`${baseUrl}/${account.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'INVALID'
        })
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });

    it('deve rejeitar status não booleano', async () => {
      const res = await request(app)
        .put(`${baseUrl}/${account.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'true'
        })
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });

    it('deve retornar 404 se conta não existe', async () => {
      const fakeId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

      const res = await request(app)
        .put(`${baseUrl}/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Novo Nome'
        })
        .expect(404);

      expect(res.body.error).toBe('Conta não encontrada');
    });

    it('deve impedir atualização de conta de outro usuário', async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: `other3.${Date.now()}@example.com`,
          passwordHash: await bcrypt.hash('senha123456', 10),
          name: 'Outro Usuário',
          preferences: { create: {} }
        }
      });

      const otherAccount = await prisma.account.create({
        data: {
          userId: otherUser.id,
          name: 'Conta Outro',
          type: 'BANK'
        }
      });

      const res = await request(app)
        .put(`${baseUrl}/${otherAccount.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Tentativa de Hack'
        })
        .expect(404);

      expect(res.body.error).toBe('Conta não encontrada');
    });

    it('deve retornar 401 sem token', async () => {
      await request(app)
        .put(`${baseUrl}/${account.id}`)
        .send({
          name: 'Novo Nome'
        })
        .expect(401);
    });
  });

  describe('DELETE /accounts/:id', () => {
    it('deve deletar conta sem transações', async () => {
      // Criar conta para deletar
      const accountToDelete = await prisma.account.create({
        data: {
          userId,
          name: 'Conta para Deletar',
          type: 'WALLET'
        }
      });

      const res = await request(app)
        .delete(`${baseUrl}/${accountToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.message).toBe('Conta deletada com sucesso');

      // Verificar se foi deletada
      const deleted = await prisma.account.findUnique({
        where: { id: accountToDelete.id }
      });
      expect(deleted).toBeNull();
    });

    it('deve impedir deleção de conta com transações', async () => {
      // Criar transação na conta
      await prisma.transaction.create({
        data: {
          userId,
          accountId: account.id,
          type: 'INCOME',
          amount: 100,
          transactionDate: new Date()
        }
      });

      const res = await request(app)
        .delete(`${baseUrl}/${account.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(res.body.error).toContain('Não é possível deletar conta com transações');
      expect(res.body.transactionCount).toBe(1);
    });

    it('deve retornar 404 se conta não existe', async () => {
      const fakeId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

      const res = await request(app)
        .delete(`${baseUrl}/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.error).toBe('Conta não encontrada');
    });

    it('deve impedir deleção de conta de outro usuário', async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: `other4.${Date.now()}@example.com`,
          passwordHash: await bcrypt.hash('senha123456', 10),
          name: 'Outro Usuário',
          preferences: { create: {} }
        }
      });

      const otherAccount = await prisma.account.create({
        data: {
          userId: otherUser.id,
          name: 'Conta Outro',
          type: 'BANK'
        }
      });

      const res = await request(app)
        .delete(`${baseUrl}/${otherAccount.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.error).toBe('Conta não encontrada');
    });

    it('deve rejeitar ID inválido', async () => {
      const res = await request(app)
        .delete(`${baseUrl}/id-invalido`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });

    it('deve retornar 401 sem token', async () => {
      await request(app)
        .delete(`${baseUrl}/${account.id}`)
        .expect(401);
    });
  });
});
