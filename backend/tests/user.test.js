// tests/user.test.js
const request = require('supertest');
const app = require('../src/app');
const { prisma } = require('../src/config/prisma');
const bcrypt = require('bcrypt');

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
});

beforeEach(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('User Routes', () => {
  const baseUrl = '/api/users';
  let token;
  let user;

  const createAndLoginUser = async () => {
    const password = 'senha123';
    const hash = await bcrypt.hash(password, 4);

    await prisma.user.create({
      data: {
        email: 'user@example.com',
        passwordHash: hash,
        name: 'Usuário Teste',
        phone: '11999999999',
        preferences: { create: {} }
      }
    });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password })
      .expect(200);

    return login.body.token;
  };

  describe('GET /users/me', () => {
    it('deve retornar dados do usuário autenticado', async () => {
      token = await createAndLoginUser();

      const res = await request(app)
        .get(`${baseUrl}/me`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email');
      expect(res.body).toHaveProperty('preferences');
    });

    it('deve retornar 401 sem token', async () => {
      await request(app).get(`${baseUrl}/me`).expect(401);
    });

    it('deve retornar 401 com token inválido', async () => {
      await request(app)
        .get(`${baseUrl}/me`)
        .set('Authorization', 'Bearer invalido')
        .expect(401);
    });
  });

  describe('PUT /users/me', () => {
    it('deve atualizar dados do usuário', async () => {
      token = await createAndLoginUser();

      const res = await request(app)
        .put(`${baseUrl}/me`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Novo Nome', phone: '21987654321' })
        .expect(200);

      expect(res.body.user.name).toBe('Novo Nome');
      expect(res.body.user.phone).toBe('21987654321');

      const updated = await prisma.user.findFirst();
      expect(updated.name).toBe('Novo Nome');
      expect(updated.phone).toBe('21987654321');
    });

    it('deve rejeitar dados inválidos', async () => {
      token = await createAndLoginUser();

      await request(app)
        .put(`${baseUrl}/me`)
        .set('Authorization', `Bearer ${token}`)
        .send({ phone: 'invalido' })
        .expect(400);
    });

    it('deve retornar 401 sem token', async () => {
      await request(app)
        .put(`${baseUrl}/me`)
        .send({ name: 'Teste' })
        .expect(401);
    });
  });

  describe('DELETE /users/me', () => {
    it('deve deletar a conta', async () => {
      token = await createAndLoginUser();

      await request(app)
        .delete(`${baseUrl}/me`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const user = await prisma.user.findFirst();
      expect(user).toBeNull();
    });
  });

  describe('PUT /users/me/preferences', () => {
    it('deve atualizar preferências', async () => {
      token = await createAndLoginUser();

      const res = await request(app)
        .put(`${baseUrl}/me/preferences`)
        .set('Authorization', `Bearer ${token}`)
        .send({ language: 'en', currency: 'USD' })
        .expect(200);

      expect(res.body.preferences.language).toBe('en');
      expect(res.body.preferences.currency).toBe('USD');
    });

    it('deve rejeitar dados inválidos', async () => {
      token = await createAndLoginUser();

      await request(app)
        .put(`${baseUrl}/me/preferences`)
        .set('Authorization', `Bearer ${token}`)
        .send({ currency: 'INVALID' })
        .expect(400);
    });

    it('deve permitir corpo vazio', async () => {
      token = await createAndLoginUser();

      const before = await prisma.userPreference.findFirst();

      await request(app)
        .put(`${baseUrl}/me/preferences`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(200);

      const after = await prisma.userPreference.findFirst();
      expect(before).toEqual(after);
    });
  });
});
