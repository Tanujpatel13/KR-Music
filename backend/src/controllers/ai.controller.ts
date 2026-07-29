import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { OpenRouterService, AiChatMessage } from '../services/openrouter.service';
import { MusicApiService } from '../services/musicApi.service';

const prisma = new PrismaClient();

export const handleAiChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages, prompt } = req.body;

    let chatMessages: AiChatMessage[] = [];

    if (Array.isArray(messages) && messages.length > 0) {
      chatMessages = messages;
    } else if (prompt) {
      chatMessages = [{ role: 'user', content: prompt }];
    } else {
      res.status(400).json({ error: 'Message content or prompt is required' });
      return;
    }

    // Call OpenRouter service using google/gemma-3-27b-it:free
    const aiResult = await OpenRouterService.generateChatResponse(chatMessages);

    let resolvedSongs: any[] = [];

    // If an action intent is returned, resolve real song tracks using MusicApiService (JioSaavn 320kbps original songs)
    if (aiResult.action) {
      const { action, query, lyricsQuery, artistName, moodOrGenre } = aiResult.action;
      const searchTarget = query || lyricsQuery || artistName || moodOrGenre;

      if (searchTarget) {
        resolvedSongs = await MusicApiService.searchTracks(searchTarget, 5);
      }

      // Fallback if searchTarget didn't return songs or action is general recommendation
      if (resolvedSongs.length === 0) {
        if (action === 'PLAY_SONG' && query) {
          resolvedSongs = await prisma.song.findMany({
            where: {
              OR: [
                { name: { contains: query } },
                { artist: { name: { contains: query } } }
              ]
            },
            include: { artist: true, album: true },
            take: 5
          });
        } else if (action === 'ARTIST_TOP_SONGS' && artistName) {
          resolvedSongs = await prisma.song.findMany({
            where: {
              artist: { name: { contains: artistName } }
            },
            include: { artist: true, album: true },
            orderBy: { playCount: 'desc' },
            take: 10
          });
        } else if (action === 'SEARCH_LYRICS' && lyricsQuery) {
          resolvedSongs = await prisma.song.findMany({
            where: {
              OR: [
                { lyrics: { text: { contains: lyricsQuery } } },
                { name: { contains: lyricsQuery } }
              ]
            },
            include: { artist: true, album: true, lyrics: true },
            take: 5
          });
        } else if (action === 'RECOMMEND_SONGS' || action === 'CREATE_PLAYLIST') {
          resolvedSongs = await MusicApiService.getTrending(8);
        }
      }

      // Safety fallback to DB songs
      if (resolvedSongs.length === 0) {
        resolvedSongs = await prisma.song.findMany({
          include: { artist: true, album: true },
          take: 5
        });
      }
    }

    res.status(200).json({
      reply: aiResult.reply,
      action: aiResult.action,
      songs: resolvedSongs,
      rawText: aiResult.rawText
    });
  } catch (error: any) {
    console.error('Error in handleAiChat controller:', error);
    res.status(500).json({
      error: 'Failed to process AI request',
      details: error.message
    });
  }
};
