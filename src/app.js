// src/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config(); // Carrega variáveis de ambiente

// Importar rotas
const authRoutes = require('./routes/authRoutes');

const app = express();

// 1. Segurança: headers HTTP
app.use(helmet());

// 2. CORS (permitir requisições do frontend)
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));

// 3. Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: { error: 'Muitas requisições deste IP, tente novamente mais tarde.' }
});
app.use('/api', globalLimiter);

// 4. Parse de JSON
app.use(express.json());

// 5. Rotas
app.use('/api/auth', authRoutes);

// 6. Rota de teste (opcional)
app.get('/', (req, res) => {
  res.json({ message: 'API Financeira com IA - Backend funcionando!' });
});

// 7. Middleware de erro (para capturar erros não tratados)
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// 8. Exportar app (para ser usado no server.js)
module.exports = app;