const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { prisma } = require('../config/prisma');

const router = express.Router();

// Criar conta
router.post('/', authMiddleware, async (req, res) => {
  const { name, type, initialBalance } = req.body;

  try {
    const account = await prisma.account.create({
      data: {
        name,
        type,
        initialBalance: initialBalance || 0,
        balance: initialBalance || 0,
        userId: req.user.userId
      }
    });

    res.json(account);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

// Listar contas
router.get('/', authMiddleware, async (req, res) => {
  const accounts = await prisma.account.findMany({
    where: { userId: req.user.userId }
  });

  res.json(accounts);
});

module.exports = router;