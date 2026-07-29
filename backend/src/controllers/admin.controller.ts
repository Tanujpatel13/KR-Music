import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { SearchService } from '../services/search.service';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. Total Streams
    const songs = await prisma.song.findMany({
      select: { playCount: true },
    });
    const totalStreams = songs.reduce((sum, song) => sum + song.playCount, 0);

    // 2. User Count & Subscription Distribution
    const totalUsers = await prisma.user.count();
    const premiumUsers = await prisma.subscription.count({
      where: {
        plan: { in: ['PREMIUM_INDIVIDUAL', 'PREMIUM_FAMILY', 'PREMIUM_STUDENT'] },
        status: 'ACTIVE',
      },
    });

    // 3. Approximate Revenue (Mock calculation from active premium memberships)
    const subscriptions = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
    });
    
    let totalRevenue = 0;
    subscriptions.forEach(sub => {
      if (sub.plan === 'PREMIUM_INDIVIDUAL') totalRevenue += 9.99;
      if (sub.plan === 'PREMIUM_FAMILY') totalRevenue += 14.99;
      if (sub.plan === 'PREMIUM_STUDENT') totalRevenue += 4.99;
    });

    // 4. Top Performing Songs
    const topSongs = await prisma.song.findMany({
      orderBy: { playCount: 'desc' },
      include: { artist: true },
      take: 5,
    });

    // 5. Active listeners count (unique users in ListeningHistory last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dailyActiveListeners = await prisma.listeningHistory.groupBy({
      by: ['userId'],
      where: {
        listenedAt: { gte: oneDayAgo },
      },
    });

    return res.status(200).json({
      metrics: {
        totalStreams,
        totalUsers,
        premiumUsers,
        freeUsers: totalUsers - premiumUsers,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        dau: dailyActiveListeners.length,
      },
      topSongs: topSongs.map(s => ({
        id: s.id,
        name: s.name,
        artist: s.artist.name,
        plays: s.playCount,
        cover: s.coverImage,
      })),
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve admin dashboard stats' });
  }
};

// Catalog Administration
export const adminUploadSong = async (req: Request, res: Response) => {
  try {
    const { name, artistId, albumId, duration, genreName, releaseYear, language, coverImage, audioUrl, lyricsText } = req.body;

    if (!name || !artistId || !duration || !coverImage || !audioUrl) {
      return res.status(400).json({ error: 'Name, artist, duration, cover, and audio URL are required' });
    }

    // Resolve or create genre
    let genreId = null;
    if (genreName) {
      const genre = await prisma.genre.upsert({
        where: { name: genreName },
        update: {},
        create: { name: genreName },
      });
      genreId = genre.id;
    }

    const song = await prisma.song.create({
      data: {
        name,
        duration: parseInt(duration, 10),
        releaseYear: releaseYear ? parseInt(releaseYear, 10) : new Date().getFullYear(),
        language: language || 'English',
        coverImage,
        audioUrl,
        artistId,
        albumId: albumId || null,
        genreId,
      },
    });

    // Add lyrics if provided
    if (lyricsText) {
      await prisma.lyrics.create({
        data: {
          songId: song.id,
          text: lyricsText,
        },
      });
    }

    // Index song in Elasticsearch
    await SearchService.indexSong(song.id);

    return res.status(201).json(song);
  } catch (error: any) {
    console.error('Song upload error:', error);
    return res.status(500).json({ error: 'Failed to upload song metadata' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: 'User deletion failed' });
  }
};
