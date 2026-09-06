const express = require('express');
const router = express.Router();
const { handleSearch } = require('../controllers/search.controller');

// Endpoint para monitoreo de salud del servidor
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'J Music Backend API',
    studio: 'Onyx Studio © 2026',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`
  });
});

// Endpoint para búsqueda de canciones
router.get('/search', handleSearch);

// Proxy de extracción de datos de transmisión
router.post('/yt-proxy/player', async (req, res) => {
  const { videoId } = req.body;

  if (!videoId) {
    return res.status(400).json({
      success: false,
      error: 'El parámetro videoId es requerido.'
    });
  }

  try {
    const ytResponse = await fetch('https://www.youtube.com/youtubei/v1/player', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        videoId: videoId,
        context: {
          client: {
            clientName: 'WEB_EMBEDDED_PLAYER',
            clientVersion: '1.20240212.01.01',
            hl: 'es',
            gl: 'US'
          }
        }
      })
    });

    const data = await ytResponse.json();

    if (!ytResponse.ok) {
      return res.status(ytResponse.status).json({
        success: false,
        error: 'YouTube rechazó la solicitud.',
        details: data
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor en el proxy de extracción.',
      message: error.message
    });
  }
});

module.exports = router;
