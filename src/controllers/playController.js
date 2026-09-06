const ytdl = require('@distube/ytdl-core');

/**
 * Controlador de la ruta POST /play.
 * Obtiene la información del video y descifra la firma de audio para cualquier canción.
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

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytdl.getInfo(videoUrl);

    // Filtrar solo formatos de audio
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

    if (!audioFormats || audioFormats.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró ningún formato de audio válido para este video.'
      });
    }

    // Ordenar de mayor a menor bitrate
    audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

    return res.status(200).json({
      success: true,
      audioUrl: audioFormats[0].url
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
