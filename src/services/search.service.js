const axios = require('axios');
const searchCache = require('../config/cache.config');
const { searchWithYtDlp } = require('./ytdlp.service');

const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';

async function searchMusic(query) {
  const cacheKey = query.toLowerCase().trim();
  const cachedResult = searchCache.get(cacheKey);

  if (cachedResult) {
    return cachedResult;
  }

  // 1. Intento principal: Key 1
  try {
    const result = await fetchYouTubeAPI(query, process.env.YOUTUBE_API_KEY_1);
    searchCache.set(cacheKey, result);
    return result;

  } catch (error1) {
    console.warn(`[ONYX] [FALLBACK] Key 1 inoperativa (${error1.message}). Activando Key 2...`);

    // 2. Respaldo: Key 2
    try {
      const result = await fetchYouTubeAPI(query, process.env.YOUTUBE_API_KEY_2);
      searchCache.set(cacheKey, result);
      return result;

    } catch (error2) {
      console.warn(`[ONYX] [FALLBACK CRÍTICO] Key 2 inoperativa (${error2.message}). Activando yt-dlp...`);

      // 3. Respaldo final: yt-dlp
      try {
        const result = await searchWithYtDlp(query);
        searchCache.set(cacheKey, result);
        return result;

      } catch (ytdlpError) {
        console.error('[ONYX] [SEARCH FATAL] Todos los proveedores de búsqueda fallaron.');
        throw new Error('Servicio de búsqueda no disponible en ningún proveedor.');
      }
    }
  }
}

async function fetchYouTubeAPI(query, apiKey) {
  if (!apiKey) {
    throw new Error('API Key no configurada');
  }

  const searchResponse = await axios.get(YOUTUBE_SEARCH_URL, {
    params: {
      part: 'snippet',
      q: query,
      type: 'video',
      videoCategoryId: '10',
      maxResults: 15,
      key: apiKey
    }
  });

  const items = searchResponse.data.items;
  if (!items || items.length === 0) return [];

  const videoIds = items.map(item => item.id.videoId).join(',');

  let durationMap = {};
  try {
    const videoResponse = await axios.get(YOUTUBE_VIDEOS_URL, {
      params: {
        part: 'contentDetails',
        id: videoIds,
        key: apiKey
      }
    });

    videoResponse.data.items.forEach(v => {
      durationMap[v.id] = parseISO8601Duration(v.contentDetails.duration);
    });
  } catch (err) {
    console.warn('[ONYX] [API WARNING] No se pudo resolver la metadata de duración.');
  }

  return items.map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    duration: durationMap[item.id.videoId] || 'N/A',
    thumbnail: item.snippet.thumbnails.medium ? item.snippet.thumbnails.medium.url : item.snippet.thumbnails.default.url
  }));
}

function parseISO8601Duration(isoDuration) {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 'N/A';

  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

module.exports = { searchMusic };
