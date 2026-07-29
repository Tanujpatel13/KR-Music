import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const createPlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, isPublic, isCollaborative } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description,
        isPublic: isPublic !== undefined ? isPublic : true,
        isCollaborative: isCollaborative !== undefined ? isCollaborative : false,
        userId,
      },
    });

    return res.status(201).json(playlist);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create playlist' });
  }
};

export const getUserPlaylists = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const playlists = await prisma.playlist.findMany({
      where: { userId },
      include: {
        songs: {
          include: {
            song: true,
          },
        },
      },
    });

    return res.status(200).json(playlists);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve playlists' });
  }
};

export const getPlaylistById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        user: {
          select: { username: true },
        },
        songs: {
          include: {
            song: {
              include: {
                artist: true,
                album: true,
              },
            },
          },
          orderBy: { addedAt: 'asc' },
        },
      },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    return res.status(200).json(playlist);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve playlist details' });
  }
};

export const addSongToPlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { playlistId } = req.params;
    const { songId } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Verify ownership or collaborative state
    if (playlist.userId !== userId && !playlist.isCollaborative) {
      return res.status(403).json({ error: 'Not authorized to modify this playlist' });
    }

    const relation = await prisma.playlistSong.create({
      data: {
        playlistId,
        songId,
      },
    });

    return res.status(201).json(relation);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to add song to playlist' });
  }
};

export const removeSongFromPlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { playlistId, songId } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });

    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

    if (playlist.userId !== userId && !playlist.isCollaborative) {
      return res.status(403).json({ error: 'Not authorized to modify this playlist' });
    }

    await prisma.playlistSong.delete({
      where: {
        playlistId_songId: { playlistId, songId },
      },
    });

    return res.status(200).json({ message: 'Song removed from playlist' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to remove song from playlist' });
  }
};

export const updatePlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic, isCollaborative } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const playlist = await prisma.playlist.findUnique({ where: { id } });

    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

    if (playlist.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this playlist' });
    }

    const updated = await prisma.playlist.update({
      where: { id },
      data: { name, description, isPublic, isCollaborative },
    });

    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update playlist' });
  }
};

export const deletePlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const playlist = await prisma.playlist.findUnique({ where: { id } });

    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

    if (playlist.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this playlist' });
    }

    await prisma.playlist.delete({ where: { id } });

    return res.status(200).json({ message: 'Playlist deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete playlist' });
  }
};

export const getPublicPlaylists = async (req: Request, res: Response) => {
  try {
    // Get playlists with only the first 4 songs for cover art (not all 138)
    const playlists = await prisma.playlist.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        name: true,
        description: true,
        coverImage: true,
        isPublic: true,
        _count: { select: { songs: true } },
        songs: {
          take: 4,
          select: {
            song: {
              select: {
                id: true,
                name: true,
                coverImage: true,
                audioUrl: true,
              },
            },
          },
        },
      },
    });

    const formatted = playlists.map((pl) => ({
      id: pl.id,
      name: pl.name,
      description: pl.description,
      coverImage: pl.coverImage || pl.songs?.[0]?.song?.coverImage || null,
      isPublic: pl.isPublic,
      songCount: pl._count.songs,
      previewSongs: pl.songs.map((ps) => ps.song),
    }));

    return res.status(200).json(formatted);
  } catch (error: any) {
    console.error('Error fetching public playlists:', error);
    return res.status(500).json({ error: 'Failed to retrieve public playlists' });
  }
};

// Get full playlist songs (paginated) — called when user opens a playlist
export const getPlaylistSongs = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const take = parseInt(req.query.limit as string, 10) || 50;
    const skip = parseInt(req.query.offset as string, 10) || 0;

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        coverImage: true,
        _count: { select: { songs: true } },
        songs: {
          skip,
          take,
          orderBy: { addedAt: 'asc' },
          select: {
            song: {
              select: {
                id: true,
                name: true,
                duration: true,
                coverImage: true,
                audioUrl: true,
                language: true,
                artist: { select: { id: true, name: true } },
                album: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

    return res.status(200).json({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      coverImage: playlist.coverImage,
      songCount: playlist._count.songs,
      songs: playlist.songs.map((ps) => ps.song),
    });
  } catch (error: any) {
    console.error('Error fetching playlist songs:', error);
    return res.status(500).json({ error: 'Failed to retrieve playlist songs' });
  }
};

