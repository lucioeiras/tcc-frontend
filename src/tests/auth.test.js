// src/tests/auth.test.js
const request = require('supertest');
const app = require('../app');
const { prisma } = require('../config/prisma');
const bcrypt = require('bcrypt');

describe('Auth Routes', () => {
  const baseUrl = '/api/auth';

  describe('POST /register', () => {
    it('deve registrar um novo usuário com dados válidos', async () => {
      const response = await request(app)
        .post(`${baseUrl}/register`)
        .send({
          email: 'teste.novo.123@example.com',
          password: 'senha123456',
          name: 'João Testador',
          company: 'Empresa XYZ'
        })
        .expect(201);

      expect(response.body.message).toBe('Usuário criado com sucesso');
      expect(response.body.token).toBeTruthy();
      expect(response.body.user).toMatchObject({
        email: 'teste.novo.123@example.com',
        name: 'João Testador',
        company: 'Empresa XYZ'
      });
      expect(response.body.user.password).toBeUndefined();

      // Verifica no banco
      const user = await prisma.user.findUnique({
        where: { email: 'teste.novo.123@example.com' }
      });

      expect(user).not.toBeNull();
      const passwordValid = await bcrypt.compare('senha123456', user.password);
      expect(passwordValid).toBe(true);
    });

    it('deve rejeitar email duplicado', async () => {
      // Cria usuário previamente
      await prisma.user.create({
        data: {
          email: 'duplicado@example.com',
          password: await bcrypt.hash('123456', 10),
          name: 'Existente'
        }
      });

      const response = await request(app)
        .post(`${baseUrl}/register`)
        .send({
          email: 'duplicado@example.com',
          password: 'outraSenha123'
        })
        .expect(400);

      expect(response.body.error).toBe('Email já cadastrado');
    });

    it('deve rejeitar email inválido', async () => {
      const res = await request(app)
        .post(`${baseUrl}/register`)
        .send({
          email: 'email-invalido',
          password: '123456'
        })
        .expect(400);

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(e => e.msg === 'Email inválido')).toBe(true);
    });
  });

  describe('POST /login', () => {
    let user;

    beforeEach(async () => {
      const hashed = await bcrypt.hash('senhaCorreta2025', 10);
      user = await prisma.user.create({
        data: {
          email: 'login.teste@example.com',
          password: hashed,
          name: 'Usuário de Teste'
        }
      });
    });

    it('deve logar com credenciais corretas', async () => {
      const res = await request(app)
        .post(`${baseUrl}/login`)
        .send({
          email: 'login.teste@example.com',
          password: 'senhaCorreta2025'
        })
        .expect(200);

      expect(res.body.message).toBe('Login bem-sucedido');
      expect(res.body.token).toBeTruthy();
      expect(res.body.user.email).toBe('login.teste@example.com');
    });

    it('deve rejeitar senha incorreta', async () => {
      const res = await request(app)
        .post(`${baseUrl}/login`)
        .send({
          email: 'login.teste@example.com',
          password: 'errado'
        })
        .expect(401);

      expect(res.body.error).toBe('Credenciais inválidas');
    });
  });
});