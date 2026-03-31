const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { prisma } = require('../config/prisma');

const router = express.Router();

// Criar transação
router.post('/', authMiddleware, async (req, res) => {
  const { accountId, amount, type, categoryId, description } = req.body;

  try {
    const transaction = await prisma.transaction.create({
      data: {
        accountId,
        amount,
        type,
        categoryId,
        description,
        transactionDate: new Date(),
        userId: req.user.userId
      }
    });

    // Atualiza saldo
    await prisma.account.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: type === 'INCOME' ? amount : -amount
        }
      }
    });

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar transação' });
  }
});

// Listar
router.get('/', authMiddleware, async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.user.userId },
    include: {
      category: true,
      account: true
    }
  });

  res.json(transactions);
});

module.exports = router;