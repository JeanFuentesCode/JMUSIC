const express = require('express');
const router = express.Router();
const { handlePlayRequest } = require('../controllers/playController');

// Ruta POST para procesar la extracción del audio
router.post('/play', handlePlayRequest);

module.exports = router;
