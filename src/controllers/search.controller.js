const { searchMusic } = require('../services/search.service');

async function handleSearch(req, res) {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'El parámetro de búsqueda "q" es obligatorio.' 
      });
    }

    const cleanQuery = q.trim();
    const results = await searchMusic(cleanQuery);
    
    res.json({ 
      success: true, 
      count: results.length,
      data: results 
    });
  } catch (error) {
    console.error(`[ONYX] [CONTROLLER ERROR] ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno en el servicio de procesamiento de búsqueda.' 
    });
  }
}

module.exports = { handleSearch };