// tests/auth.test.js
const request = require('supertest');
const app = require('../src/app');
const { prisma } = require('../src/config/prisma');
const bcrypt = require('bcrypt');

// Setup global
beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
});

// Limpeza total antes de cada teste (isolamento)
beforeEach(async () => {
  await prisma.$transaction([
    prisma.user.deleteMany()
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Auth Routes', () => {
  const baseUrl = '/api/auth';

  describe('POST /register', () => {
    it('deve registrar usuário com sucesso', async () => {
      const res = await request(app)
        .post(`${baseUrl}/register`)
        .send({
          email: 'teste@example.com',
          password: 'senha123456',
          name: 'Teste'
        })
        .expect(201);

      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.email).toBe('teste@example.com');

      const user = await prisma.user.findUnique({
        where: { email: 'teste@example.com' },
        include: { preferences: true }
      });

      expect(user).not.toBeNull();
      expect(user.preferences).not.toBeNull();

      const valid = await bcrypt.compare('senha123456', user.passwordHash);
      expect(valid).toBe(true);
    });

    it('deve rejeitar email duplicado', async () => {
      await prisma.user.create({
        data: {
          email: 'duplicado@example.com',
          passwordHash: await bcrypt.hash('123456', 4),
          name: 'Existente',
          preferences: { create: {} }
        }
      });

      const res = await request(app)
        .post(`${baseUrl}/register`)
        .send({ email: 'duplicado@example.com', password: '123456' })
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      const hash = await bcrypt.hash('senha123', 4);

      await prisma.user.create({
        data: {
          email: 'login@example.com',
          passwordHash: hash,
          name: 'Login',
          preferences: { create: {} }
        }
      });
    });

    it('deve logar com sucesso', async () => {
      const res = await request(app)
        .post(`${baseUrl}/login`)
        .send({ email: 'login@example.com', password: 'senha123' })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('deve rejeitar senha incorreta', async () => {
      await request(app)
        .post(`${baseUrl}/login`)
        .send({ email: 'login@example.com', password: 'errado' })
        .expect(401);
    });
  });

  describe('POST /refresh', () => {
    it('deve renovar token com fluxo real', async () => {
      const password = 'senha123';
      const hash = await bcrypt.hash(password, 4);

      await prisma.user.create({
        data: {
          email: 'refresh@example.com',
          passwordHash: hash,
          name: 'Refresh',
          preferences: { create: {} }
        }
      });

      const login = await request(app)
        .post(`${baseUrl}/login`)
        .send({ email: 'refresh@example.com', password })
        .expect(200);

      const res = await request(app)
        .post(`${baseUrl}/refresh`)
        .send({ refreshToken: login.body.refreshToken })
        .expect(200);

      expect(res.body).toHaveProperty('token');
    });

    it('deve rejeitar token inválido', async () => {
      await request(app)
        .post(`${baseUrl}/refresh`)
        .send({ refreshToken: 'invalido' })
        .expect(401);
    });
  });

  describe('POST /logout', () => {
    it('deve invalidar refresh token', async () => {
      const password = 'senha123';
      const hash = await bcrypt.hash(password, 4);

      const user = await prisma.user.create({
        data: {
          email: 'logout@example.com',
          passwordHash: hash,
          name: 'Logout',
          preferences: { create: {} }
        }
      });

      const login = await request(app)
        .post(`${baseUrl}/login`)
        .send({ email: 'logout@example.com', password })
        .expect(200);

      await request(app)
        .post(`${baseUrl}/logout`)
        .send({ refreshToken: login.body.refreshToken })
        .expect(200);

      const updated = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updated.refreshToken).toBeNull();
    });
  });

  describe('POST /forgot-password', () => {
    it('deve gerar reset token para usuário existente', async () => {
      await prisma.user.create({
        data: {
          email: 'forgot@example.com',
          passwordHash: await bcrypt.hash('123456', 4),
          name: 'Forgot',
          preferences: { create: {} }
        }
      });

      await request(app)
        .post(`${baseUrl}/forgot-password`)
        .send({ email: 'forgot@example.com' })
        .expect(200);

      const user = await prisma.user.findUnique({ where: { email: 'forgot@example.com' } });

      expect(user.resetToken).toBeTruthy();
      expect(user.resetTokenExpires).toBeTruthy();
    });
  });

  describe('POST /reset-password', () => {
    it('deve resetar senha com fluxo completo', async () => {
      const password = 'antiga123';
      const hash = await bcrypt.hash(password, 4);

      await prisma.user.create({
        data: {
          email: 'reset@example.com',
          passwordHash: hash,
          name: 'Reset',
          preferences: { create: {} }
        }
      });

      await request(app)
        .post(`${baseUrl}/forgot-password`)
        .send({ email: 'reset@example.com' })
        .expect(200);

      const user = await prisma.user.findUnique({ where: { email: 'reset@example.com' } });

      await request(app)
        .post(`${baseUrl}/reset-password`)
        .send({ token: user.resetToken, newPassword: 'nova123456' })
        .expect(200);

      const updated = await prisma.user.findUnique({ where: { email: 'reset@example.com' } });

      const valid = await bcrypt.compare('nova123456', updated.passwordHash);
      expect(valid).toBe(true);
      expect(updated.resetToken).toBeNull();
    });
  });
});
