'use client';

import { Play, Pause, Compass, Music, Podcast, Star, Heart, Plus, Disc, Sparkles } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setSong, setQueue, togglePlay, toggleLikeSong, setActiveAlbum, setHistory, setLikedSongs } from '../store/playerSlice';
import { useState, useEffect } from 'react';
import { MOCK_TRACKS } from '../lib/mockTracks';
import { MOCK_ALBUMS } from '../lib/mockAlbums';
import { MOCK_PLAYLISTS } from '../lib/mockPlaylists';
import Link from 'next/link';
import { usePublicPlaylists } from '../hooks/usePublicPlaylists';

const POPULAR_ARTISTS = [
  { id: 'a5', name: 'Devi Sri Prasad', image: '/static/images/pushpa.jpg', role: 'Composer' },
  { id: 'a9', name: 'A. R. Rahman', image: '/static/images/ye_maaya_chesave.jpg', role: 'Singer & Composer' },
  { id: 'a6', name: 'Hesham Abdul Wahab', image: '/static/images/hi_nanna.jpg', role: 'Composer' },
  { id: 'a10', name: 'Thaman S', image: '/static/images/ala_vaikunthapurramuloo.jpg', role: 'Composer' },
  { id: 'a7', name: 'M. M. Keeravani', image: '/static/images/magadheera.jpg', role: 'Oscar Composer' },
];

export default function HomePage() {
  const dispatch = useDispatch();
  const player = useSelector((state: RootState) => state.player);
  const [greeting, setGreeting] = useState('Good evening');
  const [activePlaylistSongId, setActivePlaylistSongId] = useState<string | null>(null);
  const [customPlaylists, setCustomPlaylists] = useState<any[]>([]);
  const [featuredAlbums, setFeaturedAlbums] = useState<any[]>([]);
  const [recommendedSongs, setRecommendedSongs] = useState<any[]>([]);
  const [dailyMixes, setDailyMixes] = useState<any[]>([]);
  
  // Dynamic API State
  const [activeTab, setActiveTab] = useState('local');
  const [country, setCountry] = useState('IN');
  const [isLoading, setIsLoading] = useState(true);

  // Load playlists — direct fetch is primary (reliable), hook is fallback
  const [publicPlaylists, setPublicPlaylists] = useState<any[]>([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(true);
  const { playlists: hookPlaylists } = usePublicPlaylists();

  // Direct fetch on mount (most reliable)
  useEffect(() => {
    setPlaylistsLoading(true);
    fetch('/api/playlists/public')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPublicPlaylists(data);
        }
      })
      .catch(err => console.warn('[Home] Could not fetch playlists:', err))
      .finally(() => setPlaylistsLoading(false));
  }, []);

  // Hook as fallback if direct fetch returned empty
  useEffect(() => {
    if (hookPlaylists.length > 0 && publicPlaylists.length === 0) {
      setPublicPlaylists(hookPlaylists);
      setPlaylistsLoading(false);
    }
  }, [hookPlaylists]);

  // Static mock playlists as final fallback (offline / no backend)
  useEffect(() => {
    if (!playlistsLoading && publicPlaylists.length === 0) {
      setPublicPlaylists(MOCK_PLAYLISTS as any);
    }
  }, [playlistsLoading, publicPlaylists.length]);

  // Country detection + home feed + customPlaylists listener
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let detectedCountry = localStorage.getItem('user_country');
      if (!detectedCountry) {
        const locale = navigator.language || '';
        detectedCountry = locale.endsWith('-IN') || locale.startsWith('hi') || locale.startsWith('te') ? 'IN' : 'US';
        localStorage.setItem('user_country', detectedCountry);
      }
      setCountry(detectedCountry);
      fetchHomeFeed(activeTab, detectedCountry);

      const loadPlaylists = () => {
        const saved = localStorage.getItem('customPlaylists');
        if (saved) setCustomPlaylists(JSON.parse(saved));
      };
      loadPlaylists();
      window.addEventListener('playlists-updated', loadPlaylists);
      return () => window.removeEventListener('playlists-updated', loadPlaylists);
    }
  }, []);


  const fetchHomeFeed = async (tabName: string, userCountry: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/songs/home?tab=${tabName}&country=${userCountry}`);
      if (!response.ok) throw new Error('API server unreachable');
      
      const data = await response.json();
      
      setRecommendedSongs(data.recommendedSongs || []);
      
      // Build daily mixes dynamically based on returned songs genres
      const mixes = [
        {
          id: 'dm1',
          name: 'Daily Mix 1',
          description: 'Top tracks selected just for you.',
          coverImage: '/static/images/ye_maaya_chesave.jpg',
          songs: data.recommendedSongs || []
        },
        {
          id: 'dm2',
          name: 'Daily Mix 2',
          description: 'New releases and hot trends.',
          coverImage: '/static/images/pushpa.jpg',
          songs: data.newReleases || []
        },
        {
          id: 'dm3',
          name: 'Daily Mix 3',
          description: 'Top charts from the streaming catalog.',
          coverImage: '/static/images/magadheera.jpg',
          songs: data.topCharts || []
        }
      ];
      setDailyMixes(mixes);

      // Build featured movie albums dynamically
      const albums = (data.newReleases || []).map((song: any) => ({
        id: song.album?.id || 'all_songs',
        name: song.album?.name || 'Single',
        coverImage: song.coverImage,
        releaseYear: song.releaseYear,
        artist: song.artist?.name || 'Various Artists',
        songs: [song]
      }));
      setFeaturedAlbums(albums.slice(0, 6));

    } catch (err) {
      console.warn('Fallback to local mock data because backend is offline:', err);
      // Fallback
      setRecommendedSongs(MOCK_TRACKS.slice(0, 6));
      setDailyMixes([
        {
          id: 'dm1',
          name: 'Daily Mix 1',
          description: 'Melodic romance tunes from A.R. Rahman and more.',
          coverImage: '/static/images/ye_maaya_chesave.jpg',
          songs: MOCK_TRACKS.filter(t => t.genre === 'Romantic Melody'),
        },
        {
          id: 'dm2',
          name: 'Daily Mix 2',
          description: 'High energy dance pop blockbusters.',
          coverImage: '/static/images/pushpa.jpg',
          songs: MOCK_TRACKS.filter(t => t.genre === 'Dance Pop'),
        },
        {
          id: 'dm3',
          name: 'Daily Mix 3',
          description: 'Classical fusion and orchestral epics.',
          coverImage: '/static/images/magadheera.jpg',
          songs: MOCK_TRACKS.filter(t => t.genre === 'Classical Fusion'),
        }
      ]);
      setFeaturedAlbums(MOCK_ALBUMS.slice(0, 6));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    fetchHomeFeed(tabId, country);
  };

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Good morning');
    else if (hours < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Load custom playlists
    const saved = localStorage.getItem('customPlaylists');
    if (saved) {
      setCustomPlaylists(JSON.parse(saved));
    }

    // Load history and liked songs from localStorage on mount
    const savedHistory = localStorage.getItem('playbackHistory');
    if (savedHistory) {
      dispatch(setHistory(JSON.parse(savedHistory)));
    }
    const savedLiked = localStorage.getItem('likedSongs');
    if (savedLiked) {
      dispatch(setLikedSongs(JSON.parse(savedLiked)));
    }
  }, []);

  const handlePlaySong = (song: any) => {
    const reduxSong = {
      ...song,
      artist: typeof song.artist === 'string' ? { id: 'a5', name: song.artist } : song.artist || { id: 'a5', name: 'Unknown' },
      album: song.album ? (typeof song.album === 'string' ? { id: song.id + '_alb', name: song.album } : song.album) : null,
    };

    if (player.currentSong?.id === song.id) {
      dispatch(togglePlay());
    } else {
      dispatch(setSong(reduxSong));
      const clickedIndex = recommendedSongs.findIndex((t) => t.id === song.id);
      const songSource = clickedIndex !== -1 ? recommendedSongs : MOCK_TRACKS;
      const finalIndex = clickedIndex !== -1 ? clickedIndex : songSource.findIndex((t) => t.id === song.id);
      const remainingQueue = songSource
        .slice(finalIndex + 1)
        .map((t) => ({
          ...t,
          artist: typeof t.artist === 'string' ? { id: 'a5', name: t.artist } : t.artist || { id: 'a5', name: 'Unknown' },
          album: t.album ? (typeof t.album === 'string' ? { id: t.id + '_alb', name: t.album } : t.album) : null,
        }));
      dispatch(setQueue(remainingQueue));
    }
  };

  const handlePlayAlbumClick = (e: React.MouseEvent, album: any) => {
    e.stopPropagation();
    if (album.songs && album.songs.length > 0) {
      const firstSongDetails = MOCK_TRACKS.find((t) => t.id === album.songs[0].id) || {
        id: album.songs[0].id,
        name: album.songs[0].name,
        duration: album.songs[0].duration,
        coverImage: album.coverImage,
        audioUrl: album.songs[0].audioUrl || `/static/audio/${album.songs[0].id}.mp3`,
      };

      const formattedFirst = {
        ...firstSongDetails,
        coverImage: (firstSongDetails as any).coverImage || album.coverImage,
        audioUrl: (firstSongDetails as any).audioUrl || album.songs[0].audioUrl || `/static/audio/${album.songs[0].id}.mp3`,
        artist: typeof (firstSongDetails as any).artist === 'string' ? { id: 'a5', name: (firstSongDetails as any).artist } : (firstSongDetails as any).artist || { id: 'a5', name: album.artist },
        album: { id: album.id, name: album.name }
      };

      dispatch(setSong(formattedFirst));
      
      const restQueue = album.songs.slice(1).map((s: any) => {
        const detail = MOCK_TRACKS.find((t) => t.id === s.id) || s;
        return {
          ...detail,
          coverImage: detail.coverImage || album.coverImage,
          audioUrl: detail.audioUrl || s.audioUrl || `/static/audio/${s.id}.mp3`,
          artist: typeof detail.artist === 'string' ? { id: 'a5', name: detail.artist } : detail.artist || { id: 'a5', name: album.artist },
          album: { id: album.id, name: album.name }
        };
      });
      dispatch(setQueue(restQueue));
    }
    dispatch(setActiveAlbum(album));
  };

  const handleAddToPlaylistClick = (songId: string) => {
    const saved = localStorage.getItem('customPlaylists');
    if (saved) {
      setCustomPlaylists(JSON.parse(saved));
    }
    setActivePlaylistSongId(activePlaylistSongId === songId ? null : songId);
  };

  const addSongToPlaylist = (playlistId: string, song: any) => {
    const saved = localStorage.getItem('customPlaylists');
    const playlistsList = saved ? JSON.parse(saved) : [];

    const songToAdd = {
      id: song.id,
      name: song.name,
      duration: song.duration,
      coverImage: song.coverImage,
      audioUrl: song.audioUrl || `/static/audio/${song.id}.mp3`,
      artist: typeof song.artist === 'string' ? { id: 'a5', name: song.artist } : song.artist || { id: 'a5', name: 'Unknown' },
      album: song.album ? (typeof song.album === 'string' ? { id: song.id + '_alb', name: song.album } : song.album) : null,
    };

    const updated = playlistsList.map((pl: any) => {
      if (pl.id === playlistId) {
        const exists = pl.songs.some((s: any) => s.id === song.id);
        if (!exists) {
          return { ...pl, songs: [...pl.songs, songToAdd] };
        }
      }
      return pl;
    });

    localStorage.setItem('customPlaylists', JSON.stringify(updated));
    window.dispatchEvent(new Event('playlists-updated'));
    setActivePlaylistSongId(null);
    alert(`Successfully added "${song.name}" to playlist!`);
  };

  const handlePlayMix = async (e: React.MouseEvent, mix: any) => {
    e.stopPropagation();
    
    // If playlist has a songCount but only previewSongs, fetch full list from backend
    if (mix.songCount && mix.id && (!mix.songs || mix.songs.length < 10)) {
      try {
        const res = await fetch(`/api/playlists/${mix.id}/songs?limit=200`);
        if (res.ok) {
          const data = await res.json();
          const songs = (data.songs || []).map((song: any) => ({
            ...song,
            audioUrl: song.audioUrl,
            coverImage: song.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300',
            artist: typeof song.artist === 'string' ? { id: 'a5', name: song.artist } : song.artist || { id: 'a5', name: 'Unknown' },
            album: song.album || { id: mix.id, name: mix.name }
          }));
          if (songs.length > 0) {
            dispatch(setSong(songs[0]));
            dispatch(setQueue(songs.slice(1)));
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch playlist songs for play:', err);
      }
    }

    const songsToPlay = mix.songs || mix.previewSongs || [];
    if (songsToPlay.length > 0) {
      const formatted = songsToPlay.map((song: any) => ({
        ...song,
        audioUrl: song.audioUrl || `/local-songs/${encodeURIComponent(song.name)}.mp3`,
        coverImage: song.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300',
        artist: typeof song.artist === 'string' ? { id: 'a5', name: song.artist } : song.artist || { id: 'a5', name: 'Unknown' },
        album: song.album || { id: mix.id, name: mix.name }
      }));
      dispatch(setSong(formatted[0]));
      dispatch(setQueue(formatted.slice(1)));
    }
  };

  return (
    <div className="p-8 pb-32 space-y-10 select-none text-brandWhite">
      {/* 1. Dynamic Header Welcome Banner */}
      <header className="relative flex justify-between items-center p-8 md:p-10 rounded-3xl border border-white/10 shadow-3xl overflow-hidden group">
        {/* Glow overlay meshes */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d] via-[#161616] to-[#0d0d0d]" />
        <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[200%] rounded-full bg-[radial-gradient(circle,_rgba(29,185,84,0.12)_0%,_transparent_60%)] filter blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-50%] right-[-10%] w-[60%] h-[180%] rounded-full bg-[radial-gradient(circle,_rgba(var(--theme-glow-color),0.08)_0%,_transparent_65%)] filter blur-2xl pointer-events-none" />
        
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-spotifyGreen/15 text-spotifyGreen border border-spotifyGreen/20">
              Premium Account
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-spotifyGreen to-[#1ED760]">KR Listener</span>
          </h1>
          <p className="text-brandMuted text-sm max-w-lg leading-relaxed">
            Start streaming your high-fidelity music catalogue. Indulge in curated regional cinematic albums, lofi study mixes, and lossless audio streams.
          </p>
          <div className="pt-2 flex gap-3">
            <button 
              onClick={() => {
                if (recommendedSongs && recommendedSongs.length > 0) {
                  handlePlaySong(recommendedSongs[0]);
                }
              }}
              className="px-5 py-2.5 rounded-full bg-spotifyGreen text-black font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-transform"
            >
              Quick Start Play
            </button>
            <button 
              onClick={() => {
                const randomTrack = MOCK_TRACKS[Math.floor(Math.random() * MOCK_TRACKS.length)];
                handlePlaySong(randomTrack);
              }}
              className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-wider border border-white/10 hover:scale-105 active:scale-95 transition-all"
            >
              Surprise Me
            </button>
          </div>
        </div>
        <div className="absolute right-6 bottom-4 text-spotifyGreen/10 pointer-events-none group-hover:scale-110 group-hover:text-spotifyGreen/20 transition-transform duration-700">
          <Sparkles className="w-48 h-48" />
        </div>
      </header>

      {/* Geolocation Country-Based Tabs */}
      <div className="flex gap-4 border-b border-white/5 pb-2">
        {[
          { id: 'local', label: 'Local Music' },
          { id: 'international', label: 'International Music' },
          { id: 'movie', label: 'Movie Soundtracks' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`pb-2 text-sm font-black transition-all border-b-2 hover:text-[#FFFFFF] active:scale-95 ${
              activeTab === tab.id
                ? 'text-spotifyGreen border-spotifyGreen'
                : 'text-brandMuted border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="h-6 w-40 bg-[#181818] animate-pulse rounded-md" />
            <div className="flex gap-6 overflow-hidden">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-56 w-44 bg-[#181818] border border-white/5 rounded-2xl animate-pulse flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Featured Playlists & Collections Section */}
          <section className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <Disc className="w-5 h-5 text-spotifyGreen" />
                  Playlists & Language Collections
                </h2>
                <p className="text-xs text-brandMuted">Your local songs, Hindi hits, Telugu melodies, and English soundtracks</p>
              </div>
              <Link href="/library" className="text-xs font-bold text-spotifyGreen hover:underline">
                View All in Library
              </Link>
            </div>

            {publicPlaylists.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-[#181818] rounded-2xl p-4 space-y-3 animate-pulse">
                    <div className="aspect-square rounded-xl bg-[#282828]" />
                    <div className="h-3 w-3/4 bg-[#282828] rounded" />
                    <div className="h-2 w-1/2 bg-[#282828] rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {publicPlaylists.map((pl) => {
                  const isHindi = pl.name?.toLowerCase().includes('hindi');
                  const isTelugu = pl.name?.toLowerCase().includes('telugu');
                  const isEnglish = pl.name?.toLowerCase().includes('english');
                  const accentColor = isHindi ? '#FF6B6B' : isTelugu ? '#FFD700' : isEnglish ? '#4FC3F7' : '#1DB954';
                  const coverSrc = pl.coverImage || (pl.songs && pl.songs[0]?.coverImage) || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300';
                  return (
                    <Link
                      key={pl.id}
                      href={`/playlist/${pl.id}`}
                      className="bg-[#181818] p-4 rounded-2xl border border-white/5 hover:border-spotifyGreen/40 hover:bg-[#222222] transition-all group relative flex flex-col justify-between shadow-lg"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-[#121212] shadow-md">
                        <img
                          src={coverSrc}
                          alt={pl.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300'; }}
                        />
                        {/* Language badge */}
                        <span
                          className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                          style={{ background: accentColor + '33', color: accentColor, border: `1px solid ${accentColor}44` }}
                        >
                          {isHindi ? '🇮🇳 Hindi' : isTelugu ? '🎬 Telugu' : isEnglish ? '🌍 English' : '🎵 All'}
                        </span>
                        <div
                          onClick={(e) => handlePlayMix(e, pl)}
                          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-spotifyGreen text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all hover:bg-[#1ed760] cursor-pointer"
                        >
                          <Play className="w-5 h-5 fill-black ml-0.5" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white truncate">{pl.name}</h3>
                        <p className="text-xs text-brandMuted line-clamp-1 mt-0.5">
                          {pl.songCount ? `${pl.songCount} tracks` : pl.previewSongs ? `${pl.previewSongs.length}+ tracks` : pl.description || 'Playlist'}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* 2. Recently Played Horizontal Carousel */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Compass className="w-5 h-5 text-spotifyGreen" />
          Recently Played
        </h2>

        <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-thin">
          {(player.history && player.history.length > 0 ? [...player.history].reverse().slice(0, 8) : MOCK_TRACKS.slice(0, 5)).map((song) => {
            const isPlayingThis = player.currentSong?.id === song.id && player.isPlaying;
            return (
              <div
                key={song.id}
                onClick={() => handlePlaySong(song)}
                className="group flex flex-col gap-3 p-4 bg-[#181818] hover:bg-[#282828] border border-white/5 rounded-2xl transition-all cursor-pointer shadow-lg w-44 flex-shrink-0 relative"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-md">
                  {song.coverImage === 'collage' ? (
                    <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5 bg-[#121212]">
                      <img src="/static/images/ye_maaya_chesave.jpg" className="w-full h-full object-cover" />
                      <img src="/static/images/rangasthalam.jpg" className="w-full h-full object-cover" />
                      <img src="/static/images/hi_nanna.jpg" className="w-full h-full object-cover" />
                      <img src="/static/images/magadheera.jpg" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <img
                      src={song.coverImage}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <button className="w-10 h-10 rounded-full bg-spotifyGreen text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform">
                      {isPlayingThis ? <Pause className="w-4 h-4 fill-black text-black" /> : <Play className="w-4 h-4 fill-black text-black ml-0.5" />}
                    </button>
                  </div>
                </div>
                <div className="truncate">
                  <p className={`font-semibold text-sm truncate ${isPlayingThis ? 'text-spotifyGreen' : 'text-brandWhite'}`}>
                    {song.name}
                  </p>
                  <p className="text-xs text-brandMuted truncate mt-0.5">{song.artist.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Daily Mixes Horizontal Scroll */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-spotifyGreen" />
          Made For You — Daily Mixes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {dailyMixes.map((mix) => (
            <div
              key={mix.id}
              onClick={(e) => handlePlayMix(e, mix)}
              className="group flex gap-4 p-5 bg-[#181818] hover:bg-[#282828] border border-white/5 rounded-2xl transition-all cursor-pointer shadow-lg items-center relative overflow-hidden"
            >
              <img
                src={mix.coverImage}
                alt=""
                className="w-20 h-20 rounded-xl object-cover shadow-md border border-white/5"
              />
              <div className="space-y-1 pr-10 flex-1 truncate">
                <h3 className="font-extrabold text-base text-brandWhite group-hover:text-spotifyGreen transition-colors truncate">
                  {mix.name}
                </h3>
                <p className="text-xs text-brandMuted line-clamp-2 leading-relaxed">
                  {mix.description}
                </p>
              </div>
              <button className="absolute right-4 w-10 h-10 rounded-full bg-spotifyGreen text-black flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-lg transition-opacity hover:scale-105 active:scale-95">
                <Play className="w-4.5 h-4.5 fill-black text-black ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Movie Albums Grids */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Disc className="w-5 h-5 text-spotifyGreen animate-spin-slow" />
          Featured Movie Albums
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {featuredAlbums.map((album) => (
            <div
              key={album.id}
              onClick={() => dispatch(setActiveAlbum(album))}
              className="group premium-card p-4 flex flex-col gap-3 relative cursor-pointer hover:border-spotifyGreen/20 transition-all shadow-xl"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-md">
                {album.coverImage === 'collage' ? (
                  <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5 bg-[#121212]">
                    <img src="/static/images/ye_maaya_chesave.jpg" className="w-full h-full object-cover" />
                    <img src="/static/images/rangasthalam.jpg" className="w-full h-full object-cover" />
                    <img src="/static/images/hi_nanna.jpg" className="w-full h-full object-cover" />
                    <img src="/static/images/magadheera.jpg" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <img
                    src={album.coverImage}
                    alt={album.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                  <button
                    onClick={(e) => handlePlayAlbumClick(e, album)}
                    className="w-11 h-11 rounded-full bg-spotifyGreen text-black flex items-center justify-center shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm truncate text-brandWhite leading-snug">{album.name}</h3>
                <p className="text-xs text-brandMuted truncate">{(album.artist as any)?.name || album.artist}</p>
                <p className="text-[10px] text-spotifyGreen font-semibold uppercase tracking-wider mt-0.5">
                  {album.songs.length} Tracks &bull; {album.releaseYear}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Recommended Row list */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Star className="w-5 h-5 text-spotifyGreen" />
          Recommended Songs
        </h2>
        <div className="bg-[#141414]/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="flex flex-col">
            {recommendedSongs.map((song, index) => {
              const isPlayingThis = player.currentSong?.id === song.id && player.isPlaying;
              const isLiked = player.likedSongs.some((s) => s.id === song.id);
              return (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-3.5 hover:bg-[#282828]/40 border-b border-white/5 last:border-0 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1 truncate" onClick={() => handlePlaySong(song)}>
                    <span className="w-6 text-center text-xs text-brandMuted relative flex items-center justify-center">
                      {isPlayingThis ? (
                        <div className="mini-equalizer flex-shrink-0" title="Playing">
                          <div className="mini-equalizer-bar" />
                          <div className="mini-equalizer-bar" />
                          <div className="mini-equalizer-bar" />
                          <div className="mini-equalizer-bar" />
                        </div>
                      ) : (
                        <>
                          <span className="group-hover:hidden">{index + 1}</span>
                          <Play className="w-3.5 h-3.5 text-spotifyGreen hidden group-hover:block fill-spotifyGreen" />
                        </>
                      )}
                    </span>
                    <img
                      src={song.coverImage}
                      alt=""
                      className="w-11 h-11 rounded-lg object-cover flex-shrink-0 border border-white/5 shadow-sm"
                    />
                    <div className="truncate">
                      <p className={`font-semibold text-sm truncate ${isPlayingThis ? 'text-spotifyGreen' : 'text-brandWhite'}`}>
                        {song.name}
                      </p>
                      <p className="text-xs text-brandMuted truncate mt-0.5">{song.artist.name}</p>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center flex-1 text-sm text-brandMuted truncate" onClick={() => handlePlaySong(song)}>
                    {typeof song.album === 'string' ? song.album : (song.album as any)?.name || 'Single'}
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    {/* Add to Playlist Widget */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToPlaylistClick(song.id);
                        }}
                        className="p-1.5 rounded-full text-brandMuted hover:text-spotifyGreen hover:bg-[#282828] transition-all"
                        title="Add to Playlist"
                      >
                        <Plus className="w-4.5 h-4.5" />
                      </button>

                      {activePlaylistSongId === song.id && (
                        <div className="absolute right-0 bottom-full mb-2 w-48 bg-[#282828] border border-white/5 rounded-lg shadow-xl z-55 p-2 text-left space-y-1">
                          <p className="text-[10px] uppercase font-bold text-brandMuted px-2 py-1">Add to Playlist</p>
                          <div className="max-h-32 overflow-y-auto scrollbar-none">
                            {customPlaylists.map((pl) => (
                              <button
                                key={pl.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addSongToPlaylist(pl.id, song);
                                }}
                                className="w-full text-left text-xs text-brandWhite hover:text-[#121212] hover:bg-spotifyGreen py-1.5 px-2 rounded font-medium transition-all truncate"
                              >
                                {pl.name}
                              </button>
                            ))}
                            {customPlaylists.length === 0 && (
                              <p className="text-[10px] text-brandMuted italic px-2 py-1">No playlists. Create one in sidebar!</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const reduxSong = {
                          id: song.id,
                          name: song.name,
                          duration: song.duration,
                          coverImage: song.coverImage,
                          audioUrl: song.audioUrl || `/static/audio/${song.id}.mp3`,
                          artist: song.artist,
                          album: song.album ? { id: song.id + '_alb', name: song.album } : null,
                        };
                        dispatch(toggleLikeSong(reduxSong));
                      }}
                      className={`transition-transform duration-200 active:scale-125 ${
                        isLiked ? 'text-spotifyGreen' : 'text-brandMuted hover:text-brandWhite'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-spotifyGreen' : ''}`} />
                    </button>
                    <span className="text-xs text-brandMuted w-12 text-right pr-2">
                      {Math.floor(song.duration / 60)}:
                      {Math.floor(song.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Popular Artists Circular Carousel */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Popular Artists</h2>
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin">
          {POPULAR_ARTISTS.map((artist) => (
            <Link
              key={artist.id}
              href={`/artist/${artist.id}`}
              className="group flex flex-col items-center text-center gap-3 p-4 bg-[#181818] hover:bg-[#282828] border border-white/5 rounded-2xl transition-all cursor-pointer shadow-lg w-40 flex-shrink-0"
            >
              <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-md">
                <img
                  src={artist.image}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 animate-fade-in"
                />
              </div>
              <div className="truncate w-full px-2">
                <h3 className="font-bold text-sm text-brandWhite group-hover:text-spotifyGreen transition-colors truncate">
                  {artist.name}
                </h3>
                <p className="text-[10px] text-brandMuted uppercase tracking-wider mt-0.5">{artist.role}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. Podcasts Panel */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Podcast className="w-5 h-5 text-spotifyGreen" />
          Featured Podcasts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { id: 'p1', title: 'The Tollywood Retrospective', publisher: 'Desi Podcast Network', coverImage: '/static/images/sirivennela.jpg' },
            { id: 'p2', title: 'Hindi Playback Masters', publisher: 'Bollywood Audio Lab', coverImage: '/static/images/kesariya.jpg' }
          ].map((pod) => (
            <div
              key={pod.id}
              className="flex items-center gap-4 bg-[#181818] hover:bg-[#282828] border border-white/5 p-4 rounded-xl transition-all cursor-pointer shadow-md"
            >
              <img
                src={pod.coverImage}
                alt={pod.title}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-spotifyGreen bg-spotifyGreen/10 px-2 py-0.5 rounded-full">
                  Podcast
                </span>
                <h3 className="font-bold text-base line-clamp-1">{pod.title}</h3>
                <p className="text-xs text-brandMuted">Publisher: {pod.publisher}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
        </>
      )}
    </div>
  );
}
