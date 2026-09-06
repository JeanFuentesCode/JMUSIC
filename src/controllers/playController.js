/**
 * Extrae la URL de audio con mayor bitrate desde streamingData.
 * @param {Object} streamingData - Estructura devuelta por YouTube.
 * @returns {string|null} URL directa del audio.
 */
function extractBestAudioUrl(streamingData) {
  if (!streamingData || !Array.isArray(streamingData.adaptiveFormats)) {
    return null;
  }

  const audioFormats = streamingData.adaptiveFormats.filter(
    (format) => format.mimeType && format.mimeType.startsWith('audio/')
  );

  if (audioFormats.length === 0) {
    return null;
  }

  audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

  return audioFormats[0].url || null;
}

/**
 * Controlador HTTP para procesar la petición de reproducción.
 */
async function handlePlayRequest(req, res) {
  try {
    const { streamingData } = req.body;

    if (!streamingData) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere el objeto streamingData en el cuerpo de la petición.'
      });
    }

    const audioUrl = extractBestAudioUrl(streamingData);

    if (!audioUrl) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró ningún formato de audio válido.'
      });
    }

    return res.status(200).json({
      success: true,
      audioUrl: audioUrl
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error interno al procesar la transmisión de audio.',
      details: error.message
    });
  }
}

module.exports = {
  extractBestAudioUrl,
  handlePlayRequest
};
