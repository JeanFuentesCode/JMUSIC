const express = require('express');
const router = express.Router();
const { handleSearch } = require('../controllers/search.controller');

router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'J Music Backend API',
    studio: 'Onyx Studio © 2026',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`
  });
});

router.get('/search', handleSearch);

module.exports = router;