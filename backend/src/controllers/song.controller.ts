import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { MusicApiService } from '../services/musicApi.service';
import axios from 'axios';

const prisma = new PrismaClient();

export const getHomeFeed = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    const country = (req.query.country as string) || 'IN';
    const tab = (req.query.tab as string) || 'local';

    // 1. Fetch dynamic API-powered songs based on current tab selection
    let feedSongs: any[] = [];
    if (tab === 'local') {
      feedSongs = await MusicApiService.getLocalMusic(country, 20);
    } else if (tab === 'movie') {
      feedSongs = await MusicApiService.getMovieSoundtracks(20);
    } else {
      feedSongs = await MusicApiService.getTrending(20);
    }

    // If API returned no results, fallback to local database songs
    if (feedSongs.length === 0) {
      feedSongs = await prisma.song.findMany({
        include: { artist: true, album: true },
        take: 20
      });
    }

    // 2. Fetch Podcasts
    const podcasts = await prisma.podcast.findMany({
      include: { episodes: { take: 1 } },
      take: 8,
    });

    // 3. Fetch Recommended Artists
    const favoriteArtists = await prisma.artist.findMany({
      orderBy: { popularity: 'desc' },
      take: 10,
    });

    // User-specific sections (Recently Played, Continue Listening)
    let recentlyPlayed: any[] = [];
    let continueListening: any[] = [];

    if (userId) {
      recentlyPlayed = await prisma.listeningHistory.findMany({
        where: { userId },
        orderBy: { listenedAt: 'desc' },
        include: {
          song: {
            include: { artist: true, album: true },
          },
        },
        take: 8,
      });

      continueListening = await prisma.listeningHistory.findMany({
        where: { userId, durationPlayed: { gt: 0 } },
        orderBy: { listenedAt: 'desc' },
        include: {
          song: {
            include: { artist: true, album: true },
          },
        },
        take: 6,
      });
    }

    // Map categories seamlessly to match the existing frontend state structure
    const recommendedSongs = feedSongs.slice(0, 8);
    const newReleases = feedSongs.slice(8, 14);
    const topCharts = feedSongs.slice(14, 20);

    return res.status(200).json({
      recentlyPlayed: recentlyPlayed.map((h) => h.song),
      recommendedSongs,
      newReleases,
      topCharts,
      podcasts,
      favoriteArtists,
      continueListening: continueListening.map((h) => h.song),
    });
  } catch (error: any) {
    console.error('Home feed fetch error:', error);
    return res.status(500).json({ error: 'Internal server error fetching home feed' });
  }
};

export const playSong = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { songId } = req.params;
    const userId = req.user?.id;

    const song = await prisma.song.update({
      where: { id: songId },
      data: { playCount: { increment: 1 } },
    });

    if (userId) {
      await prisma.listeningHistory.create({
        data: {
          userId,
          songId,
          durationPlayed: 0, // Starts at 0, updated via heartbeat/seek bar if needed
        },
      });
    }

    return res.status(200).json({ message: 'Playback registered', playCount: song.playCount });
  } catch (error: any) {
    return res.status(500).json({ error: 'Playback registration failed' });
  }
};

export const updateHistoryDuration = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { songId } = req.params;
    const { durationPlayed } = req.body; // seconds played
    const userId = req.user?.id;

    if (userId) {
      const lastSession = await prisma.listeningHistory.findFirst({
        where: { userId, songId },
        orderBy: { listenedAt: 'desc' },
      });

      if (lastSession) {
        await prisma.listeningHistory.update({
          where: { id: lastSession.id },
          data: { durationPlayed },
        });
      }
    }
    return res.status(200).json({ message: 'Listening session updated' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Session update failed' });
  }
};

export const toggleFavorite = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { songId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_songId: { userId, songId },
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: { id: existingFavorite.id },
      });

      await prisma.song.update({
        where: { id: songId },
        data: { likes: { decrement: 1 } },
      });

      return res.status(200).json({ liked: false });
    } else {
      await prisma.favorite.create({
        data: { userId, songId },
      });

      await prisma.song.update({
        where: { id: songId },
        data: { likes: { increment: 1 } },
      });

      return res.status(200).json({ liked: true });
    }
  } catch (error: any) {
    return res.status(500).json({ error: 'Toggle favorite failed' });
  }
};

export const getLyrics = async (req: Request, res: Response) => {
  try {
    const { songId } = req.params;

    const lyrics = await prisma.lyrics.findUnique({
      where: { songId },
    });

    if (!lyrics) {
      return res.status(404).json({ error: 'Lyrics not found for this song' });
    }

    return res.status(200).json(lyrics);
  } catch (error: any) {
    return res.status(500).json({ error: 'Fetch lyrics failed' });
  }
};

export const streamYoutubeVideo = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    if (!videoId) {
      return res.status(400).json({ error: 'Missing YouTube video ID' });
    }

    const streamUrl = await MusicApiService.resolveYoutubeStream(videoId);
    if (!streamUrl) {
      return res.status(404).json({ error: 'Failed to resolve audio stream for this video' });
    }

    // Forward the Range header from the browser request if it exists
    const headers: any = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    // Request the stream from GoogleVideo / Piped server, manually following redirects to preserve the Range header
    let currentUrl = streamUrl;
    let streamResponse = null;
    let redirects = 0;

    while (redirects < 5) {
      const tempResponse = await axios({
        method: 'get',
        url: currentUrl,
        headers,
        responseType: 'stream',
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
        timeout: 15000
      });

      if (tempResponse.status >= 300 && tempResponse.status < 400 && tempResponse.headers.location) {
        currentUrl = tempResponse.headers.location;
        redirects++;
        tempResponse.data.destroy(); // clean up stream
      } else {
        streamResponse = tempResponse;
        break;
      }
    }

    if (!streamResponse) {
      return res.status(404).json({ error: 'Failed to resolve audio stream' });
    }

    // Copy status code and crucial streaming headers
    res.status(streamResponse.status);
    
    const responseHeaders = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'cache-control'
    ];

    responseHeaders.forEach(headerName => {
      const headerVal = streamResponse.headers[headerName];
      if (headerVal !== undefined) {
        res.setHeader(headerName, headerVal);
      }
    });

    // Pipe the response stream
    streamResponse.data.pipe(res);

    // Clean up connections if client aborts
    req.on('close', () => {
      streamResponse.data.destroy();
    });

  } catch (error: any) {
    console.error('Youtube streaming controller proxy error:', error.message);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error streaming media' });
    }
  }
};
