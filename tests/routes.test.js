const request = require('supertest');
const app = require('../src/app');
const { prisma } = require('../src/config/prisma');

const randomEmail = () => `teste.${Date.now()}@example.com`;

async function registerAndLogin() {
  const email = randomEmail();
  const password = 'Senha12345';

  await request(app)
    .post('/api/auth/register')
    .send({ email, password, name: 'Teste Full' })
    .expect(201);

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);

  return {
    token: loginRes.body.token,
    user: loginRes.body.user
  };
}

describe('API Routes', () => {
  it('GET /api/health deve retornar status ok', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200);

    expect(res.body.status).toBe('ok');
    expect(res.body.message).toContain('API Financeira funcionando');
  });

  it('GET / deve retornar mensagem de funcionamento', async () => {
    const res = await request(app)
      .get('/')
      .expect(200);

    expect(res.body.message).toBe('API Financeira com IA - Backend funcionando!');
  });

  it('rota inválida retorna 404', async () => {
    await request(app)
      .get('/api/nao-existe')
      .expect(404);
  });

  it('GET /api/users/me exige autenticação e retorna informações do usuário', async () => {
    const { token, user } = await registerAndLogin();

    await request(app)
      .get('/api/users/me')
      .expect(401);

    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).not.toBeNull();
    expect(res.body.email).toBe(user.email);
    expect(res.body.name).toBe(user.name);
    expect(res.body.preferences).toBeDefined();
  });

  it('POST /api/accounts e GET /api/accounts', async () => {
    const { token } = await registerAndLogin();

    const newAccount = {
      name: 'Conta de Teste',
      type: 'BANK',
      initialBalance: 500.5
    };

    const createRes = await request(app)
      .post('/api/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send(newAccount)
      .expect(200);

    expect(createRes.body.name).toBe(newAccount.name);
    expect(createRes.body.type).toBe(newAccount.type);
    expect(createRes.body.balance).toBeCloseTo(newAccount.initialBalance);

    const listRes = await request(app)
      .get('/api/accounts')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.length).toBeGreaterThanOrEqual(1);
    expect(listRes.body.some(acc => acc.id === createRes.body.id)).toBe(true);
  });

  it('POST /api/transactions e GET /api/transactions', async () => {
    const { token } = await registerAndLogin();

    const account = await request(app)
      .post('/api/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Conta Transacao', type: 'WALLET', initialBalance: 100 })
      .expect(200);

    const accountId = account.body.id;

    const transactionPayload = {
      accountId,
      amount: 50,
      type: 'INCOME',
      description: 'Receita de teste'
    };

    const transactionRes = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send(transactionPayload)
      .expect(200);

    expect(transactionRes.body.accountId).toBe(accountId);
    expect(transactionRes.body.amount).toBe(transactionPayload.amount);
    expect(transactionRes.body.type).toBe('INCOME');

    const transactionsList = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(transactionsList.body)).toBe(true);
    expect(transactionsList.body.length).toBeGreaterThanOrEqual(1);
    expect(transactionsList.body.some(t => t.id === transactionRes.body.id)).toBe(true);
  });

  it('POST /api/chat/message deve responder saldo corretamente', async () => {
    const { token } = await registerAndLogin();

    const account = await request(app)
      .post('/api/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Conta Chatbot', type: 'SAVINGS', initialBalance: 300 })
      .expect(200);

    const res = await request(app)
      .post('/api/chat/message')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Qual é o meu saldo?' })
      .expect(200);

    expect(res.body.reply).toContain('Seu saldo total é R$');
  });
});
