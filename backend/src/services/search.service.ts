import { PrismaClient } from '@prisma/client';
// @ts-ignore
import { Client } from 'elasticsearch';


const prisma = new PrismaClient();

// Elasticsearch client configuration
let esClient: Client | null = null;
try {
  if (process.env.ELASTICSEARCH_NODE) {
    esClient = new Client({
      host: process.env.ELASTICSEARCH_NODE,
      log: 'error',
    });
  }
} catch (err) {
  console.warn('Elasticsearch failed to initialize. Running in Postgres fallback mode.', err);
}

export class SearchService {
  /**
   * Syncs a song to Elasticsearch index
   */
  static async indexSong(songId: string) {
    try {
      const song = await prisma.song.findUnique({
        where: { id: songId },
        include: { artist: true, album: true, genre: true },
      });

      if (!song || !esClient) return;

      await esClient.index({
        index: 'songs',
        type: '_doc',
        id: song.id,
        body: {
          name: song.name,
          artist: song.artist.name,
          album: song.album?.name || '',
          genre: song.genre?.name || '',
          language: song.language,
          releaseYear: song.releaseYear,
        },
      });
    } catch (error) {
      console.error('Elasticsearch indexing failed for song:', songId, error);
    }
  }

  /**
   * Searches songs, artists, albums, playlists, and podcasts.
   */
  static async searchCatalog(query: string, filters?: { genre?: string; year?: number; language?: string }) {
    if (!query) return { songs: [], artists: [], albums: [], playlists: [], podcasts: [] };

    // 1. Elasticsearch query if available
    if (esClient) {
      try {
        const mustQueries: any[] = [
          {
            multi_match: {
              query,
              fields: ['name^3', 'artist^2', 'album', 'genre'],
              fuzziness: 'AUTO',
            },
          },
        ];

        if (filters?.genre) {
          mustQueries.push({ term: { genre: filters.genre.toLowerCase() } });
        }
        if (filters?.year) {
          mustQueries.push({ term: { releaseYear: filters.year } });
        }
        if (filters?.language) {
          mustQueries.push({ term: { language: filters.language.toLowerCase() } });
        }

        const response = await esClient.search({
          index: 'songs',
          body: {
            query: {
              bool: {
                must: mustQueries,
              },
            },
          },
        });

        const esSongIds = response.hits.hits.map((hit: any) => hit._id);
        const songs = await prisma.song.findMany({
          where: { id: { in: esSongIds } },
          include: { artist: true, album: true },
        });

        // Parallel Postgres query for other entities (since only songs are indexed in ES for Phase 1)
        const [artists, albums, playlists, podcasts] = await Promise.all([
          prisma.artist.findMany({ where: { name: { contains: query } } }),
          prisma.album.findMany({ where: { name: { contains: query } }, include: { artist: true } }),
          prisma.playlist.findMany({ where: { name: { contains: query }, isPublic: true } }),
          prisma.podcast.findMany({ where: { title: { contains: query } } }),
        ]);

        return { songs, artists, albums, playlists, podcasts };
      } catch (err) {
        console.warn('Elasticsearch search query failed. Falling back to Postgres.', err);
      }
    }

    // 2. Postgres Fallback Mode
    const [songs, artists, albums, playlists, podcasts] = await Promise.all([
      prisma.song.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { artist: { name: { contains: query } } },
            { album: { name: { contains: query } } },
            { language: { contains: query } },
            { audioUrl: { contains: query } },
          ],
          ...(filters?.genre ? { genre: { name: { equals: filters.genre } } } : {}),
          ...(filters?.year ? { releaseYear: filters.year } : {}),
          ...(filters?.language ? { language: { equals: filters.language } } : {}),
        },
        include: { artist: true, album: true, genre: true },
        take: 100,
      }),
      prisma.artist.findMany({
        where: { name: { contains: query } },
        take: 10,
      }),
      prisma.album.findMany({
        where: { name: { contains: query } },
        include: { artist: true },
        take: 10,
      }),
      prisma.playlist.findMany({
        where: {
          name: { contains: query },
          isPublic: true,
        },
        take: 10,
      }),
      prisma.podcast.findMany({
        where: { title: { contains: query } },
        take: 10,
      }),
    ]);


    return { songs, artists, albums, playlists, podcasts };
  }
}
