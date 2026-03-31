const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { prisma } = require('../config/prisma');

const router = express.Router();

router.post('/message', authMiddleware, async (req, res) => {
  const { message } = req.body;

  try {
    let reply = "Não entendi.";

    if (message.includes('saldo')) {
      const accounts = await prisma.account.findMany({
        where: { userId: req.user.userId }
      });

      const total = accounts.reduce((sum, acc) => sum + acc.balance, 0);

      reply = `Seu saldo total é R$ ${total}`;
    }

    res.json({ reply });

  } catch (error) {
    res.status(500).json({ error: 'Erro no chatbot' });
  }
});

module.exports = router;