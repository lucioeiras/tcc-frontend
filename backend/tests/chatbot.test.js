const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../src/app");
const { prisma } = require("../src/config/prisma");

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret";
});

beforeEach(async () => {
  await prisma.$transaction([
    prisma.message.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.transaction.deleteMany(),
    prisma.account.deleteMany(),
    prisma.userPreference.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Chatbot Routes", () => {
  const baseUrl = "/api/chat";

  const createUserAndLogin = async () => {
    const password = "senha123";
    const hash = await bcrypt.hash(password, 4);

    await prisma.user.create({
      data: {
        email: "chatbot@example.com",
        passwordHash: hash,
        name: "Chatbot User",
        preferences: { create: {} },
      },
    });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "chatbot@example.com", password })
      .expect(200);

    const user = await prisma.user.findUnique({
      where: { email: "chatbot@example.com" },
    });

    return { token: login.body.token, user };
  };

  describe("POST /chat/message", () => {
    it("deve exigir autenticação", async () => {
      await request(app)
        .post(`${baseUrl}/message`)
        .send({ message: "meu saldo" })
        .expect(401);
    });

    it('deve responder saldo quando a mensagem contém "saldo"', async () => {
      const { token, user } = await createUserAndLogin();

      await prisma.account.create({
        data: {
          userId: user.id,
          name: "Conta Principal",
          type: "BANK",
          balance: 120.5,
          initialBalance: 120.5,
        },
      });

      const res = await request(app)
        .post(`${baseUrl}/message`)
        .set("Authorization", `Bearer ${token}`)
        .send({ message: "qual meu saldo?" })
        .expect(200);

      expect(res.body.reply).toBe("Seu saldo total é R$ 120.5");
    });

    it("deve retornar fallback para mensagem não reconhecida", async () => {
      const { token } = await createUserAndLogin();

      const res = await request(app)
        .post(`${baseUrl}/message`)
        .set("Authorization", `Bearer ${token}`)
        .send({ message: "texto aleatório" })
        .expect(200);

      expect(res.body.reply).toBe("Não entendi.");
    });
  });

  describe("GET /chat/history", () => {
    it("deve listar histórico resumido de conversas do usuário", async () => {
      const { token, user } = await createUserAndLogin();

      const conversation = await prisma.conversation.create({
        data: { userId: user.id },
      });

      await prisma.message.createMany({
        data: [
          {
            conversationId: conversation.id,
            sender: "USER",
            content: "Oi",
          },
          {
            conversationId: conversation.id,
            sender: "BOT",
            content: "Olá!",
          },
        ],
      });

      const res = await request(app)
        .get(`${baseUrl}/history`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty("id", conversation.id);
      expect(res.body[0]).toHaveProperty("messageCount", 2);
      expect(res.body[0]).toHaveProperty("lastMessage");
    });
  });

  describe("GET /chat/history/:conversation_id", () => {
    it("deve retornar conversa com mensagens em ordem ascendente", async () => {
      const { token, user } = await createUserAndLogin();

      const conversation = await prisma.conversation.create({
        data: { userId: user.id },
      });

      await prisma.message.createMany({
        data: [
          {
            conversationId: conversation.id,
            sender: "USER",
            content: "Primeira mensagem",
          },
          {
            conversationId: conversation.id,
            sender: "BOT",
            content: "Resposta",
          },
        ],
      });

      const res = await request(app)
        .get(`${baseUrl}/history/${conversation.id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.id).toBe(conversation.id);
      expect(Array.isArray(res.body.messages)).toBe(true);
      expect(res.body.messages[0].content).toBe("Primeira mensagem");
      expect(res.body.messages[1].content).toBe("Resposta");
    });

    it("deve retornar 400 para conversation_id inválido", async () => {
      const { token } = await createUserAndLogin();

      await request(app)
        .get(`${baseUrl}/history/invalido`)
        .set("Authorization", `Bearer ${token}`)
        .expect(400);
    });

    it("deve retornar 404 para conversa inexistente", async () => {
      const { token } = await createUserAndLogin();

      await request(app)
        .get(`${baseUrl}/history/8f213c4e-6dcd-4e98-9f3c-8b23bfca8bc3`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });
  });

  describe("DELETE /chat/history/:conversation_id", () => {
    it("deve remover conversa e mensagens", async () => {
      const { token, user } = await createUserAndLogin();

      const conversation = await prisma.conversation.create({
        data: { userId: user.id },
      });

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          sender: "USER",
          content: "Remover",
        },
      });

      await request(app)
        .delete(`${baseUrl}/history/${conversation.id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      const deletedConversation = await prisma.conversation.findUnique({
        where: { id: conversation.id },
      });
      const remainingMessages = await prisma.message.findMany({
        where: { conversationId: conversation.id },
      });

      expect(deletedConversation).toBeNull();
      expect(remainingMessages).toHaveLength(0);
    });
  });
});
