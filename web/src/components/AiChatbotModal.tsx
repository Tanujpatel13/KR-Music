'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { MOCK_TRACKS } from '../lib/mockTracks';
import {

  setSong,
  setQueue,
  addToQueue,
  togglePlay,
  playNext,
  playPrevious,
  toggleMute,
  toggleShuffle,
  toggleRepeat,
} from '../store/playerSlice';
import {
  Sparkles,
  Bot,
  User,
  X,
  Send,
  Play,
  Pause,
  Plus,
  Music,
  Mic,
  Disc,
  Radio,
  Sliders,
  Volume2,
} from 'lucide-react';


interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  action?: any;
  songs?: any[];
  timestamp: string;
}

const QUICK_SUGGESTIONS = [
  { label: '🎵 Play Kesariya', prompt: 'Play Kesariya' },
  { label: '🎤 Search lyrics: "tum hi ho"', prompt: 'Search lyrics for tum hi ho' },
  { label: '🌟 Arijit Singh Top Songs', prompt: 'Play top songs by Arijit Singh' },
  { label: '🎧 Upbeat Recommendations', prompt: 'Recommend upbeat songs' },
  { label: '➕ Create Chill Playlist', prompt: 'Create a chill acoustic playlist' },
];

// Rich Fallback Catalog for local instant resolution
const LOCAL_CATALOG = [
  {
    id: 'kesariya-1',
    name: 'Kesariya',
    artist: { id: 'a1', name: 'Arijit Singh' },
    album: { id: 'alb1', name: 'Brahmastra' },
    duration: 268,
    coverImage: '/static/images/kesariya.jpg',
    audioUrl: '/static/audio/kesariya.mp3',
  },
  {
    id: 'tum-hi-ho-1',
    name: 'Tum Hi Ho',
    artist: { id: 'a1', name: 'Arijit Singh' },
    album: { id: 'alb2', name: 'Aashiqui 2' },
    duration: 262,
    coverImage: '/static/images/tum_hi_ho.jpg',
    audioUrl: '/static/audio/tum_hi_ho.mp3',
  },
  {
    id: 'srivalli-1',
    name: 'Srivalli',
    artist: { id: 'a2', name: 'Sid Sriram' },
    album: { id: 'alb3', name: 'Pushpa' },
    duration: 224,
    coverImage: '/static/images/srivalli.jpg',
    audioUrl: '/static/audio/srivalli.mp3',
  },
  {
    id: 'samayama-1',
    name: 'Samayama',
    artist: { id: 'a6', name: 'Hesham Abdul Wahab' },
    album: { id: 'alb4', name: 'Hi Nanna' },
    duration: 278,
    coverImage: '/static/images/samayama.jpg',
    audioUrl: '/static/audio/samayama.mp3',
  },
  {
    id: 'sirivennela-1',
    name: 'Sirivennela',
    artist: { id: 'a3', name: 'Anurag Kulkarni' },
    album: { id: 'alb5', name: 'Shyam Singha Roy' },
    duration: 243,
    coverImage: '/static/images/sirivennela.jpg',
    audioUrl: '/static/audio/sirivennela.mp3',
  },
  {
    id: 'ee-hridayam-1',
    name: 'Ee Hridayam',
    artist: { id: 'a9', name: 'A. R. Rahman' },
    album: { id: 'alb6', name: 'Ye Maaya Chesave' },
    duration: 324,
    coverImage: '/static/images/ye_maaya_chesave.jpg',
    audioUrl: '/static/audio/ee_hridayam.mp3',
  },
  {
    id: 'kundanapu-bomma-1',
    name: 'Kundanapu Bomma',
    artist: { id: 'a9', name: 'A. R. Rahman' },
    album: { id: 'alb6', name: 'Ye Maaya Chesave' },
    duration: 336,
    coverImage: '/static/images/ye_maaya_chesave.jpg',
    audioUrl: '/static/audio/kundanapu_bomma.mp3',
  },
  {
    id: 'mirchi-theme-1',
    name: 'Mirchi Theme',
    artist: { id: 'a5', name: 'Devi Sri Prasad' },
    album: { id: 'alb7', name: 'Mirchi' },
    duration: 85,
    coverImage: '/static/images/mirchi.jpg',
    audioUrl: '/static/audio/mirchi_theme.mp3',
  },
  {
    id: 'feel-my-love-1',
    name: 'Feel My Love',
    artist: { id: 'a5', name: 'Devi Sri Prasad' },
    album: { id: 'alb8', name: 'Arya' },
    duration: 290,
    coverImage: '/static/images/arya.jpg',
    audioUrl: '/static/audio/feel_my_love.mp3',
  },
  {
    id: 'alara-chanchalamaina-1',
    name: 'Alara Chanchalamaina',
    artist: { id: 'a12', name: 'Malavika & Sivala Raghu' },
    album: { id: 'alb-annamayya', name: 'Annamayya Keerthanalu Vol-1' },
    duration: 245,
    coverImage: '/static/images/ala_vaikunthapurramuloo.jpg',
    audioUrl: '/static/audio/ramuloo_ramula.mp3',
  },
  {
    id: 'ramuloo-ramula-1',
    name: 'Ramuloo Ramula',
    artist: { id: 'a10', name: 'Anurag Kulkarni' },
    album: { id: 'alb9', name: 'Ala Vaikunthapurramuloo' },
    duration: 236,
    coverImage: '/static/images/ala_vaikunthapurramuloo.jpg',
    audioUrl: '/static/audio/ramuloo_ramula.mp3',
  },
  {
    id: 'samajavaragamana-1',
    name: 'Samajavaragamana',
    artist: { id: 'a2', name: 'Sid Sriram' },
    album: { id: 'alb9', name: 'Ala Vaikunthapurramuloo' },
    duration: 275,
    coverImage: '/static/images/ala_vaikunthapurramuloo.jpg',
    audioUrl: '/static/audio/samajavaragamana.mp3',
  },
  {
    id: 'inkem-inkem-1',
    name: 'Inkem Inkem Inkem Kaavaale',
    artist: { id: 'a2', name: 'Sid Sriram' },
    album: { id: 'alb-geetha', name: 'Geetha Govindam' },
    duration: 268,
    coverImage: '/static/images/ye_maaya_chesave.jpg',
    audioUrl: '/static/audio/inkem_inkem.mp3',
  },
  {
    id: 'vachindamma-1',
    name: 'Vachindamma',
    artist: { id: 'a2', name: 'Sid Sriram' },
    album: { id: 'alb-geetha', name: 'Geetha Govindam' },
    duration: 242,
    coverImage: '/static/images/ye_maaya_chesave.jpg',
    audioUrl: '/static/audio/vachindamma.mp3',
  },
  {
    id: 'panchadara-bomma-1',
    name: 'Panchadara Bomma',
    artist: { id: 'a9', name: 'M. M. Keeravani' },
    album: { id: 'alb-magadheera', name: 'Magadheera' },
    duration: 288,
    coverImage: '/static/images/mirchi.jpg',
    audioUrl: '/static/audio/panchadara_bomma.mp3',
  },
  {
    id: 'oo-antava-1',
    name: 'Oo Antava Mava Oo Oo Antava',
    artist: { id: 'a5', name: 'Indravathi Chauhan' },
    album: { id: 'alb3', name: 'Pushpa' },
    duration: 228,
    coverImage: '/static/images/srivalli.jpg',
    audioUrl: '/static/audio/oo_antava.mp3',
  },
  {
    id: 'saami-saami-1',
    name: 'Saami Saami',
    artist: { id: 'a5', name: 'Sunidhi Chauhan' },
    album: { id: 'alb3', name: 'Pushpa' },
    duration: 224,
    coverImage: '/static/images/srivalli.jpg',
    audioUrl: '/static/audio/saami_saami.mp3',
  },
  {
    id: 'adigaa-1',
    name: 'Adigaa',
    artist: { id: 'a2', name: 'Sid Sriram' },
    album: { id: 'alb4', name: 'Hi Nanna' },
    duration: 232,
    coverImage: '/static/images/samayama.jpg',
    audioUrl: '/static/audio/adigaa.mp3',
  },
  {
    id: 'pranavalaya-1',
    name: 'Pranavalaya',
    artist: { id: 'a3', name: 'Anurag Kulkarni' },
    album: { id: 'alb5', name: 'Shyam Singha Roy' },
    duration: 254,
    coverImage: '/static/images/sirivennela.jpg',
    audioUrl: '/static/audio/pranavalaya.mp3',
  },
];

// Dedicated Devotional & Sacred Music Catalog for Venkateshwara Swami & Spiritual Queries
const DEVOTIONAL_CATALOG = [
  {
    id: 'venkateshwara-suprabhatam',
    name: 'Sri Venkateswara Suprabhatam (Kousalya Supraja Rama)',
    artist: { id: 'a-subbulakshmi', name: 'M. S. Subbulakshmi' },
    album: { id: 'alb-tirumala', name: 'Tirumala Venkateshwara Swami Devotional' },
    duration: 320,
    coverImage: '/static/images/popular_hits.jpg',
    audioUrl: '/static/audio/chikiri_chikiri.mp3',
    keywords: ['venkateshwara', 'venkateswara', 'swami', 'tirumala', 'suprabhatam', 'govinda', 'balaji', 'kousalya', 'tirupati'],
  },
  {
    id: 'srinivasa-govinda',
    name: 'Srinivasa Govinda Sri Venkatesa Govinda',
    artist: { id: 'a-spb', name: 'S. P. Balasubrahmanyam' },
    album: { id: 'alb-tirumala', name: 'Annamayya Keerthanalu' },
    duration: 285,
    coverImage: '/static/images/popular_hits.jpg',
    audioUrl: '/static/audio/pranavalaya.mp3',
    keywords: ['venkateshwara', 'swami', 'govinda', 'srinivasa', 'tirupati', 'annamayya'],
  },
  {
    id: 'alara-chanchalamaina-devotional',
    name: 'Alara Chanchalamaina (Annamayya Sankeertana)',
    artist: { id: 'a-malavika', name: 'Malavika & Sivala Raghu' },
    album: { id: 'alb-annamayya', name: 'Annamayya Keerthanalu Vol-1' },
    duration: 245,
    coverImage: '/static/images/popular_hits.jpg',
    audioUrl: '/static/audio/madhura_madhuratara.mp3',
    keywords: ['alara', 'chanchalamaina', 'annamayya', 'venkateshwara', 'swami', 'keerthana'],
  },
  {
    id: 'sivuni-aana-shiva',
    name: 'Sivuni Aana (Lord Shiva Sacred Stotram)',
    artist: { id: 'a-keeravani', name: 'M. M. Keeravani' },
    album: { id: 'alb-baahubali', name: 'Baahubali Devotional' },
    duration: 210,
    coverImage: '/static/images/baahubali.jpg',
    audioUrl: '/static/audio/sivuni_aana.mp3',
    keywords: ['shiva', 'sivuni', 'aana', 'stotram', 'devotional', 'mahadev', 'bholenath'],
  },
];



const formatSongDuration = (secs?: number) => {
  if (!secs || isNaN(secs) || secs <= 0) return '3:45';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export default function AiChatbotModal() {
  const dispatch = useDispatch();
  const player = useSelector((state: RootState) => state.player);
  const { currentSong, isPlaying } = player;

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: '✨ Welcome to KR Music AI Assistant! Powered by Gemma 3 with Apple Frosted Glass design. Ask me to play any song, search by lyrics, or recommend tracks!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Comprehensive song search engine across all 120+ project tracks + Online Full MP3 APIs
  const searchSongsOnlineOrLocal = async (query: string): Promise<any[]> => {
    const rawQuery = query.toLowerCase();
    const cleanQuery = query.toLowerCase().replace(/play|search|lyrics|song|for|by|artist/gi, '').trim();

    // 0. Check Devotional Intent (Venkateshwara Swami, Suprabhatam, Govinda, Annamayya, Shiva, Stotram)
    const devotionalKeywords = ['venkateshwara', 'venkateswara', 'swami', 'govinda', 'tirumala', 'suprabhatam', 'annamayya', 'balaji', 'srinivasa', 'shiva', 'devotional', 'bhakti', 'god', 'sloka', 'stotram'];

    const isDevotionalSearch = devotionalKeywords.some(k => rawQuery.includes(k) || cleanQuery.includes(k));

    if (isDevotionalSearch) {
      const matchedDevotional = DEVOTIONAL_CATALOG.filter(s =>
        s.keywords.some(k => rawQuery.includes(k) || cleanQuery.includes(k)) ||
        s.name.toLowerCase().includes(cleanQuery)
      );

      if (matchedDevotional.length > 0) {
        return matchedDevotional;
      }
      return DEVOTIONAL_CATALOG;
    }

    if (!cleanQuery) return MOCK_TRACKS.slice(0, 5);

    // 1. Search all project tracks (MOCK_TRACKS + LOCAL_CATALOG + DEVOTIONAL_CATALOG)
    const allProjectTracks = [...DEVOTIONAL_CATALOG, ...MOCK_TRACKS, ...LOCAL_CATALOG];
    const matchedTrackIds = new Set<string>();


    const localMatches = allProjectTracks.filter((s: any) => {
      if (matchedTrackIds.has(s.id)) return false;

      const nameMatch = s.name.toLowerCase().includes(cleanQuery);
      const artistMatch = (typeof s.artist === 'string' ? s.artist : s.artist?.name || '').toLowerCase().includes(cleanQuery);
      const albumMatch = (typeof s.album === 'string' ? s.album : s.album?.name || '').toLowerCase().includes(cleanQuery);
      const genreMatch = (s.genre || '').toLowerCase().includes(cleanQuery);

      if (nameMatch || artistMatch || albumMatch || genreMatch) {
        matchedTrackIds.add(s.id);
        return true;
      }
      return false;
    });

    if (localMatches.length > 0) {
      return localMatches.map((t: any) => ({
        id: t.id,
        name: t.name,
        artist: typeof t.artist === 'string' ? { id: 'a5', name: t.artist } : t.artist || { id: 'a5', name: 'KR Artist' },
        album: typeof t.album === 'string' ? { id: `alb-${t.id}`, name: t.album } : t.album || { id: `alb-${t.id}`, name: 'KR Album' },
        duration: t.duration || 220,
        coverImage: t.coverImage || '/static/images/kesariya.jpg',
        audioUrl: t.audioUrl || `/static/audio/${t.id}.mp3`,
      }));
    }


    // 2. Query JioSaavn 320kbps Music API for exact, accurate full-length MP3 streams worldwide
    try {
      const saavnUrl = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(cleanQuery || query)}&limit=6`;
      const res = await fetch(saavnUrl);
      if (res.ok) {
        const data = await res.json();
        const results = data.data?.results || data.results || data.data;
        if (results && Array.isArray(results) && results.length > 0) {
          const saavnSongs = results.map((item: any) => {
            let audioUrl = '';
            if (item.downloadUrl && Array.isArray(item.downloadUrl) && item.downloadUrl.length > 0) {
              const highestQuality = item.downloadUrl[item.downloadUrl.length - 1] || item.downloadUrl[0];
              audioUrl = highestQuality.url || highestQuality.link || '';
            } else if (item.media_url || item.url) {
              audioUrl = item.media_url || item.url;
            }

            let coverImage = '/static/images/kesariya.jpg';
            if (item.image && Array.isArray(item.image) && item.image.length > 0) {
              const highRes = item.image[item.image.length - 1];
              coverImage = highRes.url || highRes.link || coverImage;
            } else if (typeof item.image === 'string') {
              coverImage = item.image;
            }

            let artistName = 'Popular Artist';
            if (item.primaryArtists) {
              artistName = item.primaryArtists;
            } else if (item.artists?.primary && Array.isArray(item.artists.primary) && item.artists.primary.length > 0) {
              artistName = item.artists.primary.map((a: any) => a.name).join(', ');
            } else if (item.artist) {
              artistName = typeof item.artist === 'string' ? item.artist : item.artist.name || 'Popular Artist';
            }

            return {
              id: `saavn-${item.id || Date.now()}`,
              name: item.name || item.title || cleanQuery,
              artist: { id: `art-${item.id || 'saavn'}`, name: artistName },
              album: { id: `alb-saavn`, name: item.album?.name || 'Online Music Stream' },
              duration: Number(item.duration) || 240,
              coverImage,
              audioUrl,
            };
          }).filter((t: any) => t.audioUrl && t.audioUrl.startsWith('http'));

          if (saavnSongs.length > 0) {
            return saavnSongs;
          }
        }
      }
    } catch (e) {
      console.warn('[Saavn Online Music Fetch Notice]:', e);
    }

    // 3. Query Jamendo API for 100% Full-Length MP3 streams fallback

    try {
      const jamendoUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=56d30c55&format=json&audioformat=mp32&limit=6&namesearch=${encodeURIComponent(
        cleanQuery || query
      )}`;
      const res = await fetch(jamendoUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          return data.results.map((item: any) => ({
            id: `jamendo-${item.id}`,
            name: item.name,
            artist: { id: `art-${item.artist_id}`, name: item.artist_name },
            album: { id: `alb-${item.album_id}`, name: item.album_name || 'Jamendo Hits' },
            duration: item.duration || 210,
            coverImage: item.image || item.album_image || '/static/images/kesariya.jpg',
            audioUrl: item.audio, // Full-length 320kbps MP3 audio stream!
          }));
        }
      }
    } catch (e) {
      console.warn('[AI Search] Jamendo fetch fallback notice:', e);
    }

    // 3. Query Audius API for full-length tracks
    try {
      const audiusUrl = `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(
        cleanQuery || query
      )}`;
      const res = await fetch(audiusUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          return data.data.slice(0, 6).map((item: any) => ({
            id: `audius-${item.id}`,
            name: item.title,
            artist: { id: `art-${item.user.id}`, name: item.user.name },
            album: { id: `alb-audius`, name: 'Audius Collection' },
            duration: item.duration || 220,
            coverImage: item.artwork?.['480x480'] || item.artwork?.['150x150'] || '/static/images/kesariya.jpg',
            audioUrl: `https://discoveryprovider.audius.co/v1/tracks/${item.id}/stream`, // Full-length MP3 stream!
          }));
        }
      }
    } catch (e) {
      console.warn('[AI Search] Audius fetch fallback notice:', e);
    }

    // Fallback to top full-length local songs
    return LOCAL_CATALOG.slice(0, 4);
  };


  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage.trim();
    if (!query || isLoading) return;

    const userMsgId = Date.now().toString();
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      // Build conversation history
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.text,
        }));
      history.push({ role: 'user', content: query });

      let aiReply = '';
      let aiAction: any = null;
      let aiSongs: any[] = [];

      // Try local Express Backend API first
      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
        });

        if (res.ok) {
          const data = await res.json();
          aiReply = data.reply;
          aiAction = data.action;
          aiSongs = data.songs || [];
        }
      } catch (err) {
        // Backend offline or running on static hosting
      }

      // If backend was offline or produced no songs for a song request, use client-side search engine!
      if (!aiReply || (query.toLowerCase().includes('play') && aiSongs.length === 0)) {
        const foundSongs = await searchSongsOnlineOrLocal(query);
        aiSongs = foundSongs;

        if (query.toLowerCase().includes('lyric')) {
          aiReply = `🎤 Found songs matching lyrics "${query}":`;
          aiAction = { action: 'SEARCH_LYRICS', lyricsQuery: query };
        } else if (query.toLowerCase().includes('recommend')) {
          aiReply = `🎧 Here are recommended songs matching your vibe:`;
          aiAction = { action: 'RECOMMEND_SONGS', moodOrGenre: query };
        } else if (query.toLowerCase().includes('top') || query.toLowerCase().includes('artist')) {
          aiReply = `🌟 Here are top tracks matching your request!`;
          aiAction = { action: 'ARTIST_TOP_SONGS', artistName: query };
        } else {
          aiReply = `🎵 Sure! Found "${foundSongs[0]?.name || query}" for you right now on KR Music.`;
          aiAction = { action: 'PLAY_SONG', query };
        }
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: aiReply || "Here are your requested songs!",
        action: aiAction,
        songs: aiSongs,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Automatically play the first song if action is PLAY_SONG or RECOMMEND
      if (aiSongs && aiSongs.length > 0) {
        playSingleTrack(aiSongs[0]);
        if (aiSongs.length > 1) {
          const queueItems = aiSongs.slice(1).map(formatSongObject);
          dispatch(setQueue(queueItems));
        }
      } else if (aiAction?.action === 'CONTROL_PLAYBACK' && aiAction.command) {
        executePlaybackCommand(aiAction.command);
      }
    } catch (err: any) {
      console.error('[AI Chatbot Error]:', err);
      // Client-side rescue search
      const fallbackSongs = await searchSongsOnlineOrLocal(query);
      const rescueMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `🎵 Playing "${fallbackSongs[0]?.name || query}" for you right now!`,
        songs: fallbackSongs,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, rescueMsg]);
      if (fallbackSongs.length > 0) {
        playSingleTrack(fallbackSongs[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const executePlaybackCommand = (command: string) => {
    switch (command) {
      case 'play':
      case 'pause':
        dispatch(togglePlay());
        break;
      case 'next':
        dispatch(playNext({ force: true }));
        break;
      case 'previous':
        dispatch(playPrevious());
        break;
      case 'mute':
        dispatch(toggleMute());
        break;
      case 'shuffle':
        dispatch(toggleShuffle());
        break;
      case 'repeat':
        dispatch(toggleRepeat());
        break;
    }
  };

  const formatSongObject = (song: any) => {
    let audioUrl = song.audioUrl || '/static/audio/kesariya.mp3';
    if (!audioUrl.startsWith('http') && !audioUrl.startsWith('/')) {
      audioUrl = `/static/audio/${audioUrl}`;
    }

    let coverImage = song.coverImage || '/static/images/kesariya.jpg';
    if (!coverImage.startsWith('http') && !coverImage.startsWith('/')) {
      coverImage = `/static/images/${coverImage}`;
    }

    return {
      id: song.id || `song-${Date.now()}`,
      name: song.name,
      duration: song.duration || 200,
      coverImage,
      audioUrl,
      artist: {
        id: song.artist?.id || 'a1',
        name: song.artist?.name || 'KR Music Artist',
      },
      album: song.album ? { id: song.album.id, name: song.album.name } : null,
    };
  };

  const playSingleTrack = (song: any) => {
    const formatted = formatSongObject(song);
    dispatch(setSong(formatted));

    // Instant synchronous user-gesture audio triggering to bypass browser autoplay blocks
    if (typeof window !== 'undefined') {
      const windowAudio = (window as any).audioElement;
      if (windowAudio) {
        windowAudio.src = formatted.audioUrl;
        windowAudio.load();
        windowAudio.play().catch((err: any) => {
          console.warn('[Direct Audio Playback Notice]:', err);
        });
      }
    }
  };

  const queueSingleTrack = (song: any) => {
    const formatted = formatSongObject(song);
    dispatch(addToQueue(formatted));
  };


  return (
    <>
      {/* Apple Glassmorphism Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-2xl border border-white/20 text-white rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all transform hover:scale-105 active:scale-95 group"
        title="Open KR Music Apple Glass AI Assistant"
      >
        <div className="relative flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-300 to-cyan-400 flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4 text-black animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>
        </div>
        <div className="text-left">
          <span className="block font-bold text-xs tracking-wide text-white">AI Assistant</span>
          <span className="block text-[10px] text-emerald-300/80 font-medium">Apple Frosted Glass</span>
        </div>
      </button>

      {/* Apple Glassmorphism Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-28 right-6 z-50 w-[390px] sm:w-[440px] h-[600px] bg-neutral-950/75 backdrop-blur-3xl saturate-200 border border-white/15 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Apple Glass Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-white/5 border-b border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-indigo-600 flex items-center justify-center shadow-inner border border-white/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm tracking-tight">KR Music AI</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    Gemma 3
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">Apple Frosted Glass Edition</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white border border-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3.5 py-2.5 bg-black/30 border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {QUICK_SUGGESTIONS.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(chip.prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-3 py-1.5 text-[11px] font-medium bg-white/5 hover:bg-emerald-500/20 text-neutral-200 hover:text-emerald-300 border border-white/10 hover:border-emerald-400/40 rounded-full backdrop-blur-md transition-all shadow-sm flex items-center gap-1.5"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl flex items-center justify-center shrink-0 mt-0.5 shadow">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-3xl px-4 py-3 text-xs leading-relaxed shadow-lg backdrop-blur-2xl border ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-500/90 to-teal-600/90 text-white border-emerald-400/30 rounded-br-xs'
                      : 'bg-white/10 text-neutral-100 border-white/15 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Render Interactive Embedded Song Cards */}
                  {msg.songs && msg.songs.length > 0 && (
                    <div className="mt-3 space-y-2 pt-2.5 border-t border-white/10">
                      <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5" /> Interactive Songs Found:
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {msg.songs.map((song: any, idx: number) => {
                          const isThisPlaying = currentSong?.id === song.id && isPlaying;
                          const isThisCurrentSong = currentSong?.id === song.id;

                          return (
                            <div
                              key={song.id || idx}
                              className={`flex items-center justify-between p-3 rounded-2xl border backdrop-blur-2xl transition-all shadow ${
                                isThisPlaying
                                  ? 'bg-emerald-500/20 border-emerald-400/80 shadow-[0_0_20px_rgba(29,185,84,0.3)]'
                                  : 'bg-white/10 hover:bg-white/20 border-white/15 hover:border-emerald-400/50'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 pr-2">
                                <div className="relative w-11 h-11 flex-shrink-0">
                                  <img
                                    src={
                                      song.coverImage?.startsWith('http') || song.coverImage?.startsWith('/')
                                        ? song.coverImage
                                        : `/static/images/${song.coverImage || 'kesariya.jpg'}`
                                    }
                                    alt={song.name}
                                    className="w-full h-full rounded-xl object-cover shadow border border-white/15"
                                    onError={(e: any) => {
                                      e.target.src = '/static/images/kesariya.jpg';
                                    }}
                                  />
                                  {isThisPlaying && (
                                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center backdrop-blur-xs">
                                      <div className="mini-equalizer">
                                        <div className="mini-equalizer-bar" />
                                        <div className="mini-equalizer-bar" />
                                        <div className="mini-equalizer-bar" />
                                        <div className="mini-equalizer-bar" />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                    <span className={isThisPlaying ? 'text-emerald-300 font-extrabold' : ''}>{song.name}</span>
                                    {isThisPlaying && (
                                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-400 text-black animate-pulse">
                                        Playing
                                      </span>
                                    )}
                                  </p>
                                  <div className="flex items-center gap-2 text-[10px] text-neutral-300 mt-0.5">
                                    <span className="truncate">{song.artist?.name || 'KR Music Artist'}</span>
                                    <span>•</span>
                                    <span className="font-mono text-emerald-300/90 font-semibold shrink-0">
                                      ⏱️ {formatSongDuration(song.duration)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => (isThisCurrentSong ? dispatch(togglePlay()) : playSingleTrack(song))}
                                  className={`p-2.5 rounded-full font-bold transition-all transform active:scale-95 shadow-md flex items-center justify-center ${
                                    isThisPlaying
                                      ? 'bg-emerald-400 text-black hover:bg-emerald-300'
                                      : 'bg-white/15 text-white hover:bg-emerald-400 hover:text-black border border-white/20'
                                  }`}
                                  title={isThisPlaying ? 'Pause song' : 'Play song now'}
                                >
                                  {isThisPlaying ? (
                                    <Pause className="w-3.5 h-3.5 fill-current" />
                                  ) : (
                                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => queueSingleTrack(song)}
                                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all"
                                  title="Add to player queue"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  )}

                  <span
                    className={`block text-[9px] mt-1.5 text-right ${
                      msg.sender === 'user' ? 'text-emerald-100/70' : 'text-neutral-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 backdrop-blur-xl flex items-center justify-center shrink-0 mt-0.5 shadow">
                    <User className="w-4 h-4 text-indigo-300" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2.5 text-neutral-400 text-xs pl-1">
                <div className="w-8 h-8 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                </div>
                <div className="flex gap-1.5 items-center bg-white/10 border border-white/15 backdrop-blur-xl px-4 py-2.5 rounded-3xl shadow">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Apple Glass Input Footer */}
          <div className="p-4 bg-black/40 border-t border-white/10 backdrop-blur-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2.5"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Gemma AI: 'Play Kesariya', 'Recommend songs'..."
                className="flex-1 bg-white/10 hover:bg-white/15 focus:bg-white/15 text-white placeholder-neutral-400 text-xs rounded-2xl px-4 py-3 border border-white/15 focus:outline-none focus:border-emerald-400/60 backdrop-blur-xl transition-all shadow-inner"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 disabled:opacity-50 text-black font-bold transition-all shadow-lg transform active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
