import { Request, Response } from 'express';
import { SearchService } from '../services/search.service';
import { MusicApiService } from '../services/musicApi.service';

export const search = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const genre = req.query.genre as string;
    const yearStr = req.query.year as string;
    const language = req.query.language as string;

    const limit = parseInt(req.query.limit as string, 10) || 100;
    const offset = parseInt(req.query.offset as string, 10) || 0;

    const filters: any = {};
    if (genre) filters.genre = genre;
    if (yearStr) filters.year = parseInt(yearStr, 10);
    if (language) filters.language = language;

    if (!query) {
      return res.status(200).json({
        songs: [],
        artists: [],
        albums: [],
        playlists: [],
        podcasts: [],
      });
    }

    // 1. Fetch local catalog matches (always — includes local mp3 files)
    const results = await SearchService.searchCatalog(query, filters);

    // Map to standardized song shape for frontend
    const localSongs = results.songs.map((s: any) => ({
      id: s.id,
      name: s.name,
      duration: s.duration,
      coverImage: s.coverImage,
      audioUrl: s.audioUrl,
      artist: s.artist ? { id: s.artist.id, name: s.artist.name } : { id: 'local', name: 'Unknown' },
      album: s.album ? { id: s.album.id, name: s.album.name } : null,
      language: s.language,
      isLocal: true,
    }));

    // 2. Optionally fetch live original tracks from JioSaavn engine
    let externalSongs: any[] = [];
    try {
      externalSongs = await MusicApiService.searchTracks(query, limit, offset);
    } catch (err) {
      console.warn('JioSaavn search failed, using local DB only:', err);
    }

    // 3. Merge: local songs shown first, then live songs (no duplicates by name)
    const mergedSongsMap = new Map<string, any>();

    // Add local songs first (they stream real local files)
    localSongs.forEach((s: any) => mergedSongsMap.set(s.id, s));

    // Add external JioSaavn songs (live streams), skip if already have same track by ID
    externalSongs.forEach((s: any) => {
      if (!mergedSongsMap.has(s.id)) {
        mergedSongsMap.set(s.id, s);
      }
    });

    const finalSongs = Array.from(mergedSongsMap.values()).slice(offset, offset + limit);

    return res.status(200).json({
      ...results,
      songs: finalSongs,
    });
  } catch (error: any) {
    console.error('Search controller error:', error);
    return res.status(500).json({ error: 'Internal server error executing search' });
  }
};

