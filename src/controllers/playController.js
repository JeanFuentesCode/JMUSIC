/**
 * Extrae la URL de audio con mayor bitrate que tenga URL directa.
 */
function extractBestAudioUrl(streamingData) {
  if (!streamingData || !Array.isArray(streamingData.adaptiveFormats)) {
    return null;
  }

  const audioFormats = streamingData.adaptiveFormats.filter(
    (format) => format.mimeType && format.mimeType.startsWith('audio/') && format.url
  );

  if (audioFormats.length === 0) {
    return null;
  }

  audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

  return audioFormats[0].url;
}

/**
 * Consulta la API de YouTube usando clientes internos para omitir la detección anti-bot.
 */
async function fetchAudioFromYouTube(videoId) {
  const clients = [
    { clientName: 'ANDROID_VR', clientVersion: '1.60.19' },
    { clientName: 'ANDROID_EMBEDDED_PLAYER', clientVersion: '17.50.2' },
    { clientName: 'IOS', clientVersion: '19.08.2' },
    { clientName: 'TVHTML5_SIMPLY_EMBEDDED_PLAYER', clientVersion: '2.0' }
  ];

  for (const client of clients) {
    try {
      const response = await fetch('https://www.youtube.com/youtubei/v1/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: videoId,
          context: { client }
        })
      });

      if (!response.ok) continue;

      const data = await response.json();
      const audioUrl = extractBestAudioUrl(data.streamingData);

      if (audioUrl) return audioUrl;
    } catch (error) {
      // Continúa con el siguiente cliente en la lista
    }
  }

  return null;
}

/**
 * Controlador de la ruta POST /play.
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

    const audioUrl = await fetchAudioFromYouTube(videoId);

    if (!audioUrl) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró una dirección de audio directa para este video.'
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
  handlePlayRequest
};
