import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import axios from 'axios';

const prisma = new PrismaClient();

// 1. Fetch User Profile Details & Statistics
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized profile request' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        profilePic: true,
        role: true,
        createdAt: true,
        playlists: { select: { id: true } },
        favorites: { select: { id: true } },
        listeningHistory: { select: { id: true } },
        followers: { select: { id: true } },
        following: { select: { id: true } },
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Map stats counts
    const profileData = {
      id: user.id,
      email: user.email,
      username: user.username,
      profilePic: user.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
      role: user.role,
      createdAt: user.createdAt,
      stats: {
        playedCount: user.listeningHistory.length,
        playlistsCount: user.playlists.length,
        likedCount: user.favorites.length,
        followersCount: user.followers.length,
        followingCount: user.following.length,
      }
    };

    return res.status(200).json(profileData);
  } catch (error: any) {
    console.error('getProfile error:', error);
    return res.status(500).json({ error: 'Internal server error fetching user profile' });
  }
};

// 2. Update User Profile details
export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { username, email, profilePic } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized profile update' });
    }

    // Verify username/email uniqueness if changing
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ],
        NOT: { id: userId }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Username or email already in use' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        email,
        profilePic
      },
      select: {
        id: true,
        email: true,
        username: true,
        profilePic: true,
        role: true
      }
    });

    return res.status(200).json(updated);
  } catch (error: any) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ error: 'Failed to save profile modifications' });
  }
};

// 3. Recommendation System logic
export const getRecommendations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized recommendations request' });
    }

    // Fetch user liked genres
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      select: {
        song: {
          select: { genreId: true }
        }
      },
      take: 20
    });

    const userGenres = favorites
      .map(f => f.song?.genreId)
      .filter((g): g is string => !!g);

    // Fetch matching songs in user's favorite genres
    const recommendations = await prisma.song.findMany({
      where: userGenres.length > 0 ? { genreId: { in: userGenres } } : {},
      include: { artist: true, album: true },
      orderBy: { playCount: 'desc' },
      take: 12
    });

    return res.status(200).json(recommendations);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to calculate custom recommendations feed' });
  }
};

// 4. Wrap Jamendo API querying search
export const getExternalSongs = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(200).json([]);
    }

    // Using Jamendo V3 API (public sandbox client ID)
    const jamendoId = process.env.JAMENDO_CLIENT_ID || '56d30c55';
    const jamendoUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${jamendoId}&format=json&limit=15&namesearch=${encodeURIComponent(query)}`;

    const response = await axios.get(jamendoUrl);
    const results = response.data.results || [];

    // Map to local song structure schema
    const formatted = results.map((track: any) => ({
      id: 'ext_' + track.id,
      name: track.name,
      duration: track.duration,
      coverImage: track.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300',
      audioUrl: track.audio,
      artist: { id: 'ext_art_' + track.artist_id, name: track.artist_name },
      album: track.album_name || 'Single',
      genre: 'External Stream',
      language: 'English'
    }));

    return res.status(200).json(formatted);
  } catch (error: any) {
    console.error('Jamendo API search failure:', error.message);
    // Silent fallback to empty results instead of crashing
    return res.status(200).json([]);
  }
};

// 5. Toggle Follow Relations (User/Artist)
export const toggleFollow = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { targetArtistId, targetUserId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required to follow profiles' });
    }

    if (!targetArtistId && !targetUserId) {
      return res.status(400).json({ error: 'Specify artist or user ID to follow' });
    }

    // Check existing follow
    const existing = await prisma.follower.findFirst({
      where: {
        followerId: userId,
        artistId: targetArtistId || null,
        followingId: targetUserId || null
      }
    });

    if (existing) {
      // Unfollow
      await prisma.follower.delete({
        where: { id: existing.id }
      });
      return res.status(200).json({ followed: false });
    } else {
      // Follow
      await prisma.follower.create({
        data: {
          followerId: userId,
          artistId: targetArtistId || null,
          followingId: targetUserId || null
        }
      });
      return res.status(200).json({ followed: true });
    }
  } catch (error: any) {
    console.error('toggleFollow failure:', error);
    return res.status(500).json({ error: 'Failed to update follow connection' });
  }
};
