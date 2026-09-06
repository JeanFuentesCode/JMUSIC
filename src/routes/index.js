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
        'User-Agent': 'Mozilla/5.0 (Android; TV; HaystackNews/3.8.3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.181 Mobile Safari/537.36',
        'Referer': 'https://www.youtube.com/'
      },
      body: JSON.stringify({
        videoId: videoId,
        context: {
          client: {
            clientName: 'ANDROID_VR',
            clientVersion: '1.59.19',
            deviceModel: 'Oculus Quest 2',
            osName: 'Android',
            osVersion: '10',
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

    // Validar si la reproducibilidad fue aprobada por YouTube
    if (data.playabilityStatus && data.playabilityStatus.status !== 'OK') {
      return res.status(400).json({
        success: false,
        error: data.playabilityStatus.reason || 'El video no está disponible.',
        details: data.playabilityStatus
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
