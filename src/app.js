const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');

const app = express();

// 1. Configuración de CORS
const allowedOrigins = [
  'https://onyxdesign.lat',
  'https://www.onyxdesign.lat',
  'https://jmusic.onyxdesign.lat', // Tu nuevo subdominio
  'https://hoppscotch.io',
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por política de seguridad CORS'));
    }
  }
}));

// 2. Configuración de Rate Limiting (Máximo 60 peticiones cada 15 minutos por IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Has excedido el límite de búsquedas permitidas. Intenta nuevamente en unos minutos.'
  }
});

app.use(limiter);

app.use(express.json());
app.use('/', routes);

module.exports = app;
