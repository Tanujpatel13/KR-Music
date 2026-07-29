import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import CryptoJS from 'crypto-js';

const prisma = new PrismaClient();

// Get Jamendo client ID from env or use default public sandbox key
const getJamendoClientId = () => {
  return process.env.JAMENDO_CLIENT_ID || '56d30c55';
};

// Retrieve a working Audius API node URL dynamically or use fallback
let audiusNodeCache = '';
const getAudiusNode = async (): Promise<string> => {
  if (audiusNodeCache) return audiusNodeCache;
  try {
    const response = await axios.get('https://api.audius.co');
    if (response.data && response.data.data && response.data.data.length > 0) {
      audiusNodeCache = response.data.data[0];
      return audiusNodeCache;
    }
  } catch (error) {
    console.warn('Failed to resolve active Audius node, using fallback provider.');
  }
  return 'https://discoveryprovider.audius.co';
};

export class MusicApiService {
  /**
   * Helper: Decrypt JioSaavn encrypted_media_url to 320kbps / 160kbps stream URL
   */
  private static decryptJioSaavnUrl(encryptedUrl: string): string | null {
    if (!encryptedUrl) return null;
    try {
      const key = CryptoJS.enc.Utf8.parse('38346591');
      const decrypted = CryptoJS.DES.decrypt(encryptedUrl, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      });
      let url = decrypted.toString(CryptoJS.enc.Utf8);
      if (!url) return null;
      // Upgrade stream quality to 320kbps
      if (url.includes('_96.mp4')) {
        url = url.replace('_96.mp4', '_320.mp4');
      }
      return url;
    } catch (err: any) {
      console.error('JioSaavn URL decryption failed:', err.message);
      return null;
    }
  }

  /**
   * Helper: Query JioSaavn Search API for authentic original songs
   */
  private static async queryJioSaavnSearch(query: string, limit = 20, offset = 0): Promise<any[]> {
    try {
      const page = Math.floor(offset / limit) + 1;
      const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(query)}&_format=json&_marker=0&p=${page}&n=${limit}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 8000
      });

      const results = response.data?.results || [];
      const tracks: any[] = [];

      for (const item of results) {
        if (!item.encrypted_media_url) continue;

        let streamUrl = this.decryptJioSaavnUrl(item.encrypted_media_url);
        if (!streamUrl && item.media_preview_url) {
          streamUrl = item.media_preview_url;
        }
        if (!streamUrl) continue;

        // Upgrade artwork resolution (150x150 -> 500x500)
        let coverImage = item.image || '';
        if (coverImage) {
          coverImage = coverImage.replace('150x150', '500x500').replace('50x50', '500x500');
        } else {
          coverImage = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';
        }

        const songTitle = item.song ? item.song.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&') : 'Untitled Song';
        const artistName = item.primary_artists || item.singers || item.music || 'Popular Artist';
        const albumName = item.album ? item.album.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&') : 'Single';

        tracks.push({
          id: 'js_' + item.id,
          isJioSaavn: true,
          name: songTitle,
          duration: parseInt(item.duration, 10) || 240,
          coverImage,
          audioUrl: streamUrl,
          artist_name: artistName,
          artist_id: 'js_art_' + (item.primary_artists_id ? item.primary_artists_id.split(',')[0].trim() : 'unknown'),
          album_name: albumName,
          album_id: 'js_alb_' + (item.albumid || item.id),
          musicgenre: item.language ? (item.language.charAt(0).toUpperCase() + item.language.slice(1) + ' Music') : 'Bollywood',
          releaseYear: parseInt(item.year, 10) || 2026,
          lyricsSnippet: item.lyrics_snippet || ''
        });
      }

      return tracks;
    } catch (error: any) {
      console.error('JioSaavn Search API failed:', error.message);
      return [];
    }
  }

  /**
   * Search songs across JioSaavn (primary for real/original songs) with YouTube & Jamendo fallbacks
   */
  static async searchTracks(query: string, limit = 20, offset = 0) {
    if (!query) return [];

    // 1. Primary: Search JioSaavn for authentic original tracks
    let tracks = await this.queryJioSaavnSearch(query, limit, offset);

    // 2. Fallback: Query YouTube Search if JioSaavn returned no results
    if (tracks.length === 0) {
      tracks = await this.queryYoutubeSearch(query, limit, offset);
    }

    // Cache results and return db models
    const cachedSongs = [];
    for (const t of tracks) {
      try {
        const cached = await this.cacheTrackInDb(t);
        if (cached) cachedSongs.push(cached);
      } catch (err) {
        console.error('Error caching search result track:', err);
      }
    }
    return cachedSongs;
  }

  /**
   * Fetch trending/popular tracks
   */
  static async getTrending(limit = 15, offset = 0) {
    let tracks = await this.queryJioSaavnSearch('Top Hits 2026', limit, offset);

    if (tracks.length === 0) {
      tracks = await this.queryJamendoTrending(limit, offset);
    }
    if (tracks.length === 0) {
      tracks = await this.queryAudiusTrending(limit, offset);
    }

    const cachedSongs = [];
    for (const t of tracks) {
      try {
        const cached = await this.cacheTrackInDb(t);
        if (cached) cachedSongs.push(cached);
      } catch (err) {
        console.error('Error caching trending track:', err);
      }
    }
    return cachedSongs;
  }

  /**
   * Fetch local tracks based on country
   */
  static async getLocalMusic(country: string, limit = 15, offset = 0) {
    const isIndia = country?.toUpperCase() === 'IN';
    const searchQuery = isIndia ? 'Bollywood Hits' : 'Top Global Pop Hits';

    let tracks = await this.queryJioSaavnSearch(searchQuery, limit, offset);

    if (tracks.length === 0) {
      const tags = isIndia ? 'bolly,india,pop' : 'pop,rock,dance';
      tracks = await this.queryJamendoByTags(tags, limit, offset);
    }
    if (tracks.length === 0) {
      tracks = await this.getTrending(limit, offset);
    }

    const cachedSongs = [];
    for (const t of tracks) {
      try {
        const cached = await this.cacheTrackInDb(t);
        if (cached) cachedSongs.push(cached);
      } catch (err) {
        console.error('Error caching local music track:', err);
      }
    }
    return cachedSongs;
  }

  /**
   * Fetch movie soundtracks
   */
  static async getMovieSoundtracks(limit = 15, offset = 0) {
    let tracks = await this.queryJioSaavnSearch('Aashiqui 2 Soundtrack', limit, offset);

    if (tracks.length === 0) {
      tracks = await this.queryJamendoByTags('soundtrack,score,instrumental', limit, offset);
    }
    if (tracks.length === 0) {
      tracks = await this.getTrending(limit, offset);
    }

    const cachedSongs = [];
    for (const t of tracks) {
      try {
        const cached = await this.cacheTrackInDb(t);
        if (cached) cachedSongs.push(cached);
      } catch (err) {
        console.error('Error caching movie soundtrack track:', err);
      }
    }
    return cachedSongs;
  }

  /**
   * Helper: Parse ISO 8601 duration (e.g. PT3M45S) into seconds
   */
  private static parseISO8601Duration(durationString: string): number {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = durationString.match(regex);
    if (!matches) return 180;
    const hours = parseInt(matches[1] || '0', 10);
    const minutes = parseInt(matches[2] || '0', 10);
    const seconds = parseInt(matches[3] || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Helper: Query YouTube Search using YouTube Data API v3 or Piped fallback
   */
  private static async queryYoutubeSearch(query: string, limit: number, offset: number): Promise<any[]> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (apiKey) {
      try {
        console.log('Searching YouTube via Official Data API...');
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${limit}&key=${apiKey}`;
        const searchResponse = await axios.get(searchUrl);
        const items = searchResponse.data.items || [];
        
        if (items.length === 0) return [];
        
        const videoIds = items.map((item: any) => item.id.videoId).filter(Boolean);
        let durations: Record<string, number> = {};
        
        if (videoIds.length > 0) {
          try {
            const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(',')}&key=${apiKey}`;
            const detailsResponse = await axios.get(videoDetailsUrl);
            const detailItems = detailsResponse.data.items || [];
            detailItems.forEach((dItem: any) => {
              durations[dItem.id] = this.parseISO8601Duration(dItem.contentDetails?.duration || 'PT3M');
            });
          } catch (detErr: any) {
            console.error('Failed to fetch YouTube video durations:', detErr.message);
          }
        }
        
        return items.map((item: any) => {
          const vId = item.id.videoId;
          return {
            id: 'yt_' + vId,
            isYoutube: true,
            name: item.snippet?.title || 'YouTube Song',
            duration: durations[vId] || 180,
            coverImage: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300',
            audioUrl: `/api/songs/yt-stream/${vId}`,
            artist_name: item.snippet?.channelTitle || 'YouTube Artist',
            artist_id: 'yt_art_' + (item.snippet?.channelId || 'unknown'),
            album_name: 'YouTube Single',
            album_id: 'yt_alb_' + vId,
            musicgenre: 'YouTube Music',
            releasedate: item.snippet?.publishedAt || new Date().toISOString()
          };
        });
      } catch (error: any) {
        console.error('YouTube Data API Search failed, falling back to Piped API...', error.message);
      }
    }

    return await this.queryPipedSearch(query, limit, offset);
  }

  /**
   * Helper: Query Piped API search
   */
  private static async queryPipedSearch(query: string, limit: number, offset: number): Promise<any[]> {
    const instances = [
      'https://pipedapi.kavin.rocks',
      'https://api.piped.yt',
      'https://piped-api.lunar.icu',
      'https://pipedapi.col.ooo',
      'https://piped-api.mha.fi'
    ];

    for (const base of instances) {
      try {
        console.log(`Searching YouTube via Piped API instance: ${base}...`);
        const response = await axios.get(`${base}/search?q=${encodeURIComponent(query)}&filter=videos`, { timeout: 6000 });
        const items = response.data.items || [];
        
        const videos = items.filter((item: any) => item.type === 'stream');
        const sliced = videos.slice(offset, offset + limit);
        
        return sliced.map((item: any) => {
          const videoId = item.url ? item.url.split('v=')[1] : null;
          if (!videoId) return null;
          return {
            id: 'yt_' + videoId,
            isYoutube: true,
            name: item.title || 'YouTube Song',
            duration: item.duration || 180,
            coverImage: item.thumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300',
            audioUrl: `/api/songs/yt-stream/${videoId}`,
            artist_name: item.uploaderName || 'YouTube Artist',
            artist_id: 'yt_art_' + (item.uploaderUrl ? item.uploaderUrl.split('/channel/')[1] || 'unknown' : 'unknown'),
            album_name: 'YouTube Single',
            album_id: 'yt_alb_' + videoId,
            musicgenre: 'YouTube Music',
            releasedate: new Date().toISOString()
          };
        }).filter(Boolean);
      } catch (err: any) {
        console.warn(`Piped search instance ${base} failed: ${err.message}. Trying next...`);
      }
    }
    console.error('All Piped API instances failed for search.');
    return [];
  }

  /**
   * Resolves a streamable audio URL from a YouTube video ID using Piped API nodes
   */
  static async resolveYoutubeStream(videoId: string): Promise<string | null> {
    const instances = [
      'https://pipedapi.kavin.rocks',
      'https://api.piped.yt',
      'https://piped-api.lunar.icu',
      'https://pipedapi.col.ooo',
      'https://piped-api.mha.fi'
    ];

    for (const base of instances) {
      try {
        console.log(`Resolving stream for video ${videoId} via Piped instance: ${base}...`);
        const response = await axios.get(`${base}/streams/${videoId}`, { timeout: 6000 });
        const audioStreams = response.data.audioStreams || [];
        if (audioStreams.length > 0) {
          const m4aStream = audioStreams.find((s: any) => s.format === 'M4A' || s.mimeType?.includes('audio/mp4'));
          const selected = m4aStream || audioStreams[0];
          return selected.url;
        }
      } catch (err: any) {
        console.warn(`Piped resolve instance ${base} failed: ${err.message}. Trying next...`);
      }
    }
    console.error(`Failed to resolve stream for video ${videoId} across all instances.`);
    return null;
  }

  /**
   * Helper: Query Jamendo Search
   */
  private static async queryJamendoSearch(query: string, limit: number, offset: number): Promise<any[]> {
    try {
      const clientId = getJamendoClientId();
      const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=${limit}&offset=${offset}&namesearch=${encodeURIComponent(query)}`;
      const response = await axios.get(url);
      return response.data.results || [];
    } catch (error: any) {
      console.error('Jamendo Search API request failed:', error.message);
      return [];
    }
  }

  /**
   * Helper: Query Jamendo Trending
   */
  private static async queryJamendoTrending(limit: number, offset: number): Promise<any[]> {
    try {
      const clientId = getJamendoClientId();
      const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=${limit}&offset=${offset}&order=popularity_total`;
      const response = await axios.get(url);
      return response.data.results || [];
    } catch (error: any) {
      console.error('Jamendo Trending API request failed:', error.message);
      return [];
    }
  }

  /**
   * Helper: Query Jamendo by Tags/Genre
   */
  private static async queryJamendoByTags(tags: string, limit: number, offset: number): Promise<any[]> {
    try {
      const clientId = getJamendoClientId();
      const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=${limit}&offset=${offset}&tags=${tags}&order=popularity_total`;
      const response = await axios.get(url);
      return response.data.results || [];
    } catch (error: any) {
      console.error('Jamendo Tags API request failed:', error.message);
      return [];
    }
  }

  /**
   * Helper: Query Audius Search
   */
  private static async queryAudiusSearch(query: string, limit: number, offset: number): Promise<any[]> {
    try {
      const node = await getAudiusNode();
      const url = `${node}/v1/tracks/search?query=${encodeURIComponent(query)}`;
      const response = await axios.get(url);
      const results = response.data.data || [];
      return results.slice(offset, offset + limit);
    } catch (error: any) {
      console.error('Audius Search API request failed:', error.message);
      return [];
    }
  }

  /**
   * Helper: Query Audius Trending
   */
  private static async queryAudiusTrending(limit: number, offset: number): Promise<any[]> {
    try {
      const node = await getAudiusNode();
      const url = `${node}/v1/tracks/trending`;
      const response = await axios.get(url);
      const results = response.data.data || [];
      return results.slice(offset, offset + limit);
    } catch (error: any) {
      console.error('Audius Trending API request failed:', error.message);
      return [];
    }
  }

  /**
   * Caches a standardized track layout in SQLite
   */
  private static async cacheTrackInDb(track: any) {
    if (!track) return null;

    // Detect track properties based on source API structure
    const isJioSaavn = track.isJioSaavn || String(track.id).startsWith('js_');
    const isYoutube = !isJioSaavn && (track.isYoutube || String(track.id).startsWith('yt_'));
    const isJamendo = !isJioSaavn && !isYoutube && !!track.audio;

    let songId = '';
    let prefix = '';
    if (isJioSaavn) {
      songId = String(track.id);
      prefix = 'js_';
    } else if (isYoutube) {
      songId = String(track.id);
      prefix = 'yt_';
    } else {
      prefix = isJamendo ? 'ext_jam_' : 'ext_aud_';
      songId = prefix + String(track.id);
    }

    // 1. Check if song already exists in cache
    const existingSong = await prisma.song.findUnique({
      where: { id: songId },
      include: { artist: true, album: true }
    });

    if (existingSong) {
      return existingSong;
    }

    // 2. Resolve parameters
    const songName = track.name || track.title || 'Untitled Stream';
    const duration = parseInt(track.duration, 10) || 180;
    const audioUrl = isJioSaavn ? track.audioUrl : (isYoutube ? track.audioUrl : (track.audio || (track.id ? `${await getAudiusNode()}/v1/tracks/${track.id}/stream` : '')));
    const coverImage = track.coverImage || track.image || track.artwork?.['150x150'] || track.artwork?.['480x480'] || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300';
    const releaseYear = track.releaseYear || (track.releasedate ? new Date(track.releasedate).getFullYear() : 2026);

    const artistRawName = isJioSaavn ? (track.artist_name || 'JioSaavn Artist') : (isYoutube ? (track.artist_name || 'YouTube Artist') : (isJamendo ? (track.artist_name || 'Jamendo Artist') : (track.user?.name || 'Audius Artist')));
    const artistRawId = isJioSaavn ? (track.artist_id || 'js_art_unknown') : (isYoutube ? (track.artist_id || 'yt_art_unknown') : (isJamendo ? String(track.artist_id) : String(track.user?.id)));
    const artistId = (isJioSaavn || isYoutube) ? artistRawId : (prefix + 'art_' + artistRawId);

    const albumRawName = isJioSaavn ? (track.album_name || 'Album') : (isYoutube ? (track.album_name || 'YouTube Single') : (isJamendo ? (track.album_name || 'Single') : 'Single'));
    const albumRawId = isJioSaavn ? (track.album_id || 'js_alb_unknown') : (isYoutube ? (track.album_id || 'yt_alb_unknown') : (isJamendo ? String(track.album_id || 'single') : 'single'));
    const albumId = (isJioSaavn || isYoutube) ? albumRawId : (prefix + 'alb_' + albumRawId);

    const genreName = isJioSaavn ? (track.musicgenre || 'Bollywood') : (isYoutube ? 'YouTube Music' : (isJamendo ? (track.musicgenre || 'Alternative') : (track.genre || 'Alternative')));

    // 3. Find or Create relational records
    const artist = await prisma.artist.upsert({
      where: { id: artistId },
      update: { name: artistRawName },
      create: {
        id: artistId,
        name: artistRawName,
        bio: 'External artist streaming from global open platforms.',
        image: coverImage,
        popularity: 50
      }
    });

    const album = await prisma.album.upsert({
      where: { id: albumId },
      update: { name: albumRawName, coverImage },
      create: {
        id: albumId,
        name: albumRawName,
        coverImage,
        releaseYear,
        artistId: artist.id
      }
    });

    const genre = await prisma.genre.upsert({
      where: { name: genreName },
      update: {},
      create: { name: genreName }
    });

    // 4. Create new Song record cache
    const newSong = await prisma.song.create({
      data: {
        id: songId,
        name: songName,
        duration,
        releaseYear,
        coverImage,
        audioUrl,
        artistId: artist.id,
        albumId: album.id,
        genreId: genre.id,
        language: genreName.toLowerCase().includes('hindi') || genreName.toLowerCase().includes('regional') || genreName.toLowerCase().includes('telugu') || genreName.toLowerCase().includes('bollywood') ? 'Regional' : 'English'
      },
      include: { artist: true, album: true }
    });

    // Seed lyrics if missing
    const lyricsText = track.lyricsSnippet
      ? `[00:05] ${songName}\n[00:10] Artist: ${artistRawName}\n[00:15] ${track.lyricsSnippet}\n[00:30] (Playing original track stream)\n[01:00] End of preview text`
      : `[00:05] Listening to ${songName}\n[00:15] Artist: ${artistRawName}\n[00:30] Original High-Quality Stream\n[01:00] (Instrumental continuation)`;

    await prisma.lyrics.create({
      data: {
        songId: newSong.id,
        text: lyricsText
      }
    });

    return newSong;
  }
}
