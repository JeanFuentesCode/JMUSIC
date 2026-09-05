const { execFile } = require('child_process');
const util = require('util');
const path = require('path');

const execFilePromise = util.promisify(execFile);
const ytdlpPath = path.join(__dirname, '../../bin/yt-dlp');

async function searchWithYtDlp(query) {
  try {
    console.log(`[ONYX] [YT-DLP] Ejecutando motor de búsqueda principal para: "${query}"`);
    
    const args = [
      '-J',
      '--flat-playlist',
      '--no-warnings',
      '--js-runtimes', 'node',
      `ytsearch15:${query}`
    ];

    const { stdout } = await execFilePromise(ytdlpPath, args);
    const data = JSON.parse(stdout);
    
    if (!data.entries || data.entries.length === 0) {
      console.warn(`[ONYX] [YT-DLP] No se encontraron coincidencias para: "${query}"`);
      return [];
    }

    return data.entries.map(item => ({
      id: item.id,
      title: item.title,
      artist: item.uploader || item.channel || 'Artista Desconocido',
      duration: formatDuration(item.duration),
      thumbnail: item.thumbnail || (item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[0].url : `https://i.ytimg.com/vi/${item.id}/mqdefault.jpg`)
    }));

  } catch (error) {
    console.error(`[ONYX] [YT-DLP ERROR] Falla en ejecución del motor local: ${error.message}`);
    throw new Error('Error en procesamiento de yt-dlp');
  }
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return 'N/A';
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

module.exports = { searchWithYtDlp };