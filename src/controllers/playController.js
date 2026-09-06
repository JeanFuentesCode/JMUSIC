/**
 * Extrae la URL de audio con mayor bitrate desde la estructura streamingData de YouTube.
 * @param {Object} streamingData - Estructura devuelta por el endpoint de YouTube.
 * @returns {string|null} URL directa de la pista de audio.
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

  // Ordenar de mayor a menor calidad según bitrate
  audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

  return audioFormats[0].url || null;
}

/**
 * Controlador de la ruta POST /play.
 * Recibe { "videoId": "ID_DEL_VIDEO" }, consulta la API interna de YouTube y retorna la URL de audio.
 */
async function handlePlayRequest(req, res) {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere el parámetro videoId en el cuerpo de la petición.'
      });
    }

    // Consulta directa a la API de YouTube usando el cliente ANDROID_VR
    const response = await fetch('https://www.youtube.com/youtubei/v1/player', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        videoId: videoId,
        context: {
          client: {
            clientName: 'ANDROID_VR',
            clientVersion: '1.60.19'
          }
        }
      })
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: 'Error al comunicarse con los servidores de YouTube.'
      });
    }

    const youtubeData = await response.json();
    const audioUrl = extractBestAudioUrl(youtubeData.streamingData);

    if (!audioUrl) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró ningún formato de audio válido para este video.'
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
