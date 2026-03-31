const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { prisma } = require('../config/prisma');

const router = express.Router();

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId || req.user.id },
      include: { preferences: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

module.exports = router;