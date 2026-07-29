'use client';

import { Play, Heart, Music, FolderHeart, Disc, Trash2, ArrowLeft, RefreshCw, LogOut, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setSong, setQueue, setSpotifyConnected, setSpotifyAccessToken } from '../../store/playerSlice';
import Link from 'next/link';
import {
  getSpotifyAuthUrl,
  fetchSpotifyPlaylists,
  fetchSpotifyPlaylistTracks,
  MOCK_SPOTIFY_USER,
  MOCK_SPOTIFY_PLAYLISTS,
} from '../../lib/spotifyService';
import { usePublicPlaylists } from '../../hooks/usePublicPlaylists';

export default function LibraryPage() {
  const dispatch = useDispatch();
  const player = useSelector((state: RootState) => state.player);
  const { isSpotifyConnected, spotifyAccessToken } = player;

  const [playlists, setPlaylists] = useState<any[]>([]);
  const [spotifyPlaylists, setSpotifyPlaylistsState] = useState<any[]>([]);
  const [selectedSpotifyPlaylist, setSelectedSpotifyPlaylist] = useState<any | null>(null);
  const [spotifyTracks, setSpotifyTracks] = useState<any[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [customClientId, setCustomClientId] = useState('');
  const [spotifyProfile, setSpotifyProfile] = useState<any | null>(null);

  const { playlists: publicPlaylists, loading: publicPlaylistsLoading } = usePublicPlaylists();

  // Direct fetch fallback — ensures Language Collections always loads even if hook cache is stale
  const [directPlaylists, setDirectPlaylists] = useState<any[]>([]);
  const [directLoading, setDirectLoading] = useState(true);
  useEffect(() => {
    setDirectLoading(true);
    fetch('/api/playlists/public')
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data) && data.length > 0) setDirectPlaylists(data); })
      .catch(() => {})
      .finally(() => setDirectLoading(false));
  }, []);

  // Use whichever has data first
  const effectivePlaylists = directPlaylists.length > 0 ? directPlaylists : publicPlaylists;
  const effectiveLoading = directLoading && publicPlaylistsLoading;

  // Load user playlists from localStorage
  const loadPlaylists = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('customPlaylists');
      if (saved) {
        setPlaylists(JSON.parse(saved));
      }
    }
  };


  // Load Spotify Profile & Playlists based on connection state
  const loadSpotifyData = async () => {
    if (typeof window === 'undefined') return;
    const mode = localStorage.getItem('spotify_connected_mode');

    if (mode === 'simulated') {
      setSpotifyProfile(MOCK_SPOTIFY_USER);
      setSpotifyPlaylistsState(MOCK_SPOTIFY_PLAYLISTS);
    } else if (mode === 'real' && spotifyAccessToken) {
      // Profile
      const savedProfile = localStorage.getItem('spotify_user_profile');
      if (savedProfile) {
        setSpotifyProfile(JSON.parse(savedProfile));
      }
      
      // Playlists
      const lists = await fetchSpotifyPlaylists(spotifyAccessToken);
      setSpotifyPlaylistsState(
        lists.map((pl: any) => ({
          id: pl.id,
          name: pl.name,
          description: pl.description || 'Imported Spotify playlist.',
          coverImage: pl.images?.[0]?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop',
          songs: [], // tracks will fetch on selection
        }))
      );
    } else {
      setSpotifyProfile(null);
      setSpotifyPlaylistsState([]);
    }
  };

  useEffect(() => {
    loadPlaylists();
    loadSpotifyData();

    window.addEventListener('playlists-updated', loadPlaylists);
    window.addEventListener('spotify-connection-changed', loadSpotifyData);
    
    return () => {
      window.removeEventListener('playlists-updated', loadPlaylists);
      window.removeEventListener('spotify-connection-changed', loadSpotifyData);
    };
  }, [spotifyAccessToken, isSpotifyConnected]);

  // Load tracks when a Spotify playlist is selected
  useEffect(() => {
    const fetchTracks = async () => {
      if (!selectedSpotifyPlaylist) return;
      
      const mode = localStorage.getItem('spotify_connected_mode');
      if (mode === 'simulated') {
        setSpotifyTracks(selectedSpotifyPlaylist.songs || []);
      } else if (mode === 'real' && spotifyAccessToken) {
        setIsLoadingTracks(true);
        const tracks = await fetchSpotifyPlaylistTracks(spotifyAccessToken, selectedSpotifyPlaylist.id);
        setSpotifyTracks(tracks);
        setIsLoadingTracks(false);
      }
    };
    fetchTracks();
  }, [selectedSpotifyPlaylist, spotifyAccessToken]);

  const handleSimulatedConnect = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spotify_connected_mode', 'simulated');
      dispatch(setSpotifyConnected(true));
      window.dispatchEvent(new Event('spotify-connection-changed'));
      setIsAuthModalOpen(false);
      alert('Successfully linked Spotify (Simulated sandbox account)!');
    }
  };

  const handleRealConnect = () => {
    const authUrl = getSpotifyAuthUrl(customClientId);
    if (customClientId) {
      localStorage.setItem('spotify_custom_client_id', customClientId);
    }
    setIsAuthModalOpen(false);
    window.location.href = authUrl;
  };

  const handleDisconnect = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_token_expiry');
      localStorage.removeItem('spotify_connected_mode');
      localStorage.removeItem('spotify_user_profile');
      dispatch(setSpotifyConnected(false));
      dispatch(setSpotifyAccessToken(null));
      setSelectedSpotifyPlaylist(null);
      setSpotifyProfile(null);
      setSpotifyPlaylistsState([]);
      window.dispatchEvent(new Event('spotify-connection-changed'));
      alert('Disconnected Spotify account successfully.');
    }
  };

  const handlePlayLikedSongs = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (player.likedSongs.length > 0) {
      dispatch(setSong(player.likedSongs[0]));
      dispatch(setQueue(player.likedSongs.slice(1)));
    }
  };

  const handlePlayPlaylist = (e: React.MouseEvent, playlist: any) => {
    e.stopPropagation();
    if (playlist.songs && playlist.songs.length > 0) {
      const formattedSongs = playlist.songs.map((song: any) => ({
        ...song,
        artist: typeof song.artist === 'string' ? { id: 'a5', name: song.artist } : song.artist || { id: 'a5', name: 'Unknown' },
        album: song.album || { id: playlist.id, name: playlist.name }
      }));
      dispatch(setSong(formattedSongs[0]));
      dispatch(setQueue(formattedSongs.slice(1)));
    }
  };

  const handlePlaySpotifySong = (song: any, allTracks: any[]) => {
    dispatch(setSong(song));
    const clickedIndex = allTracks.findIndex((s) => s.id === song.id);
    const finalIndex = clickedIndex !== -1 ? clickedIndex : 0;
    const otherSongs = allTracks.slice(finalIndex + 1);
    dispatch(setQueue(otherSongs));
  };

  const handlePlayEntireSpotifyPlaylist = () => {
    if (spotifyTracks.length > 0) {
      dispatch(setSong(spotifyTracks[0]));
      dispatch(setQueue(spotifyTracks.slice(1)));
    }
  };

  const handleDeletePlaylist = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the playlist "${name}"?`)) {
      const updated = playlists.filter((pl) => String(pl.id) !== String(id));
      localStorage.setItem('customPlaylists', JSON.stringify(updated));
      window.dispatchEvent(new Event('playlists-updated'));
    }
  };

  return (
    <div className="p-8 pb-32 space-y-10 text-brandWhite select-none animate-fade-in relative min-h-full">
      
      {/* 1. Header Banner */}
      {!selectedSpotifyPlaylist && (
        <header className="flex justify-between items-center bg-gradient-to-r from-brandElevated to-brandBg p-8 rounded-2xl border border-brandHighlight shadow-2xl relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Your <span className="text-brandNeon">Library</span>
            </h1>
            <p className="text-brandMuted text-sm max-w-md">
              Manage your custom listening experiences, liked tracks, and linked Spotify playlists.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10 text-brandNeon pointer-events-none">
            <FolderHeart className="w-56 h-56" />
          </div>
        </header>
      )}

      {/* 2. Detail Explorer View for Spotify Playlists */}
      {selectedSpotifyPlaylist && (
        <div className="space-y-8 animate-slide-up">
          <button
            onClick={() => setSelectedSpotifyPlaylist(null)}
            className="flex items-center gap-2 text-brandMuted hover:text-brandNeon text-sm font-bold uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Library
          </button>

          <div className="flex flex-col md:flex-row items-end gap-6 pb-6 border-b border-brandElevated">
            <img
              src={selectedSpotifyPlaylist.coverImage}
              alt={selectedSpotifyPlaylist.name}
              className="w-48 h-48 rounded-xl object-cover shadow-2xl border border-brandHighlight/40 flex-shrink-0"
            />
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold uppercase bg-brandNeon/10 text-brandNeon px-2.5 py-0.5 rounded-full border border-brandNeon/20">
                Spotify Playlist
              </span>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">{selectedSpotifyPlaylist.name}</h1>
              <p className="text-sm text-brandMuted">{selectedSpotifyPlaylist.description}</p>
              {spotifyTracks.length > 0 && (
                <button
                  onClick={handlePlayEntireSpotifyPlaylist}
                  className="mt-4 px-6 py-2.5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold rounded-full transition-transform active:scale-95 text-sm flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-black" /> Play Playlist
                </button>
              )}
            </div>
          </div>

          {/* Tracks feed */}
          <div className="space-y-1">
            {isLoadingTracks ? (
              <div className="flex flex-col items-center justify-center p-20 text-brandMuted space-y-4">
                <RefreshCw className="w-10 h-10 animate-spin text-brandNeon" />
                <p className="text-sm">Fetching tracks from Spotify Web API...</p>
              </div>
            ) : (
              spotifyTracks.map((song, index) => {
                const isPlayingThis = player.currentSong?.id === song.id && player.isPlaying;
                return (
                  <div
                    key={song.id}
                    onClick={() => handlePlaySpotifySong(song, spotifyTracks)}
                    className="flex items-center px-4 py-3 rounded-lg hover:bg-brandElevated/60 cursor-pointer group transition-colors"
                  >
                    <span className="w-8 text-center text-brandMuted group-hover:hidden">
                      {isPlayingThis ? (
                        <Music className="w-4 h-4 text-[#1DB954] animate-pulse mx-auto" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="w-8 text-center hidden group-hover:block">
                      <Play className="w-4 h-4 text-brandWhite mx-auto fill-brandWhite" />
                    </span>
                    
                    <img
                      src={song.coverImage}
                      alt=""
                      className="w-10 h-10 rounded object-cover ml-4 flex-shrink-0"
                    />

                    <div className="flex-1 pl-4 truncate">
                      <p className={`font-semibold text-sm truncate ${isPlayingThis ? 'text-[#1DB954]' : 'text-brandWhite'}`}>
                        {song.name}
                      </p>
                      <p className="text-xs text-brandMuted truncate">
                        {song.artist?.name || 'Spotify Artist'}
                      </p>
                    </div>

                    <span className="w-16 text-right text-sm text-brandMuted">
                      {Math.floor(song.duration / 60)}:
                      {Math.floor(song.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                );
              })
            )}

            {!isLoadingTracks && spotifyTracks.length === 0 && (
              <div className="text-center p-20 text-brandMuted">
                <Music className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse" />
                <p className="text-sm italic">No playable preview tracks in this playlist.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Main Dashboard cards */}
      {!selectedSpotifyPlaylist && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card A: Liked Songs Card */}
          <div
            onClick={() => { if (player.likedSongs.length > 0) dispatch(setSong(player.likedSongs[0])); }}
            className="group glass-card p-6 rounded-2xl flex flex-col justify-between aspect-video md:aspect-square relative cursor-pointer border border-brandHighlight hover:border-brandNeon/30 transition-all shadow-xl bg-gradient-to-br from-purple-950/20 via-blue-950/20 to-black/45"
          >
            <div className="flex justify-between items-start">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10 text-brandWhite shadow-lg">
                <Heart className="w-8 h-8 fill-brandWhite text-brandWhite" />
              </div>
              <button
                onClick={handlePlayLikedSongs}
                disabled={player.likedSongs.length === 0}
                className="w-12 h-12 rounded-full bg-brandNeon text-brandBg flex items-center justify-center shadow-lg transform translate-y-3 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                <Play className="w-5 h-5 fill-brandBg ml-0.5" />
              </button>
            </div>

            <div className="space-y-1">
              <Link href="/favorites" className="text-2xl font-black tracking-tight hover:underline text-brandWhite block">
                Liked Songs
              </Link>
              <p className="text-xs text-brandNeon font-semibold uppercase tracking-wider">
                {player.likedSongs.length} Tracks &bull; offline cache
              </p>
            </div>
          </div>

          {/* Card B: Spotify Integration Connection Card */}
          {!isSpotifyConnected ? (
            <div className="group glass-card p-6 rounded-2xl flex flex-col justify-between aspect-video md:aspect-square relative border border-[#1DB954]/20 hover:border-[#1DB954]/50 transition-all shadow-xl bg-gradient-to-br from-[#1DB954]/10 via-black/30 to-black/55">
              <div className="flex justify-between items-start">
                <div className="p-4 bg-[#1DB954]/10 rounded-2xl border border-[#1DB954]/20 text-[#1DB954] shadow-lg">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.3 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.3z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3 mt-4">
                <h3 className="text-xl font-black tracking-tight text-brandWhite">Spotify Account</h3>
                <p className="text-xs text-brandMuted leading-relaxed">
                  Link with your existing Spotify account. Browse, load, and play all your Spotify playlists directly inside KR Music.
                </p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full py-2.5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold rounded-full transition-all text-sm shadow-md"
                >
                  Link Spotify
                </button>
              </div>
            </div>
          ) : (
            /* Card B (Active): Spotify Connected Banner */
            <div className="group glass-card p-6 rounded-2xl flex flex-col justify-between aspect-video md:aspect-square relative border border-[#1DB954]/50 hover:border-[#1DB954] transition-all shadow-xl bg-gradient-to-br from-[#1DB954]/20 via-black/40 to-black/60 relative">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img
                    src={spotifyProfile?.images?.[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'}
                    alt="Spotify Avatar"
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#1DB954]"
                  />
                  <div className="truncate">
                    <p className="text-xs text-[#1DB954] font-extrabold uppercase flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 fill-[#1DB954]" />
                      CONNECTED
                    </p>
                    <h4 className="text-sm font-black truncate max-w-[120px] text-brandWhite">
                      {spotifyProfile?.display_name || 'Spotify Listener'}
                    </h4>
                  </div>
                </div>

                <button
                  onClick={handleDisconnect}
                  className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-red-500 hover:text-red-400 transition-colors"
                  title="Disconnect Spotify"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-brandMuted font-bold uppercase">
                  <span>Spotify Feed Status</span>
                </div>
                <p className="text-xs text-brandWhite/80 leading-relaxed font-semibold">
                  Synchronizing {spotifyPlaylists.length} playlists. Click on any Spotify playlist below to listen to preview tracks.
                </p>
              </div>
            </div>
          )}

          {/* Card C: Explaining local features */}
          <div className="group glass-card p-6 rounded-2xl flex flex-col justify-between aspect-video md:aspect-square relative border border-brandHighlight hover:border-brandHighlight/80 transition-all shadow-xl bg-gradient-to-br from-brandElevated to-brandBg">
            <div className="p-4 bg-brandHighlight rounded-2xl text-brandNeon">
              <Music className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black text-brandWhite">Lossless Engine</h4>
              <p className="text-xs text-brandMuted leading-relaxed">
                Lossless audio decoding powered by KR Music Audio Pipeline. Connect premium sound outputs for theatrical acoustics.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* 4. Playlists grids */}
      {!selectedSpotifyPlaylist && (
        <div className="space-y-10">
          
          {/* Section A: Spotify Playlists */}
          {isSpotifyConnected && (
            <section className="space-y-4 animate-slide-up">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-[#1DB954]">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.3 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.3z" />
                </svg>
                Spotify Playlists
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {spotifyPlaylists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => setSelectedSpotifyPlaylist(pl)}
                    className="group flex items-center justify-between p-4 bg-[#121212]/40 hover:bg-[#1f1f1f]/50 border border-brandHighlight hover:border-[#1DB954]/30 rounded-xl transition-all cursor-pointer shadow-lg"
                  >
                    <div className="flex items-center gap-4 flex-1 truncate">
                      <img
                        src={pl.coverImage}
                        alt={pl.name}
                        className="w-16 h-16 rounded-lg object-cover shadow-md border border-brandHighlight flex-shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-base truncate text-brandWhite group-hover:text-[#1DB954] transition-colors">
                          {pl.name}
                        </p>
                        <p className="text-xs text-brandMuted truncate font-medium">
                          {pl.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section B: Language Collections (from backend) */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Disc className="w-5 h-5 text-spotifyGreen" />
              Language Collections
            </h2>

            {effectiveLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-brandElevated rounded-xl animate-pulse">
                    <div className="w-16 h-16 rounded-lg bg-brandHighlight flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-brandHighlight rounded w-1/2" />
                      <div className="h-2 bg-brandHighlight rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {effectivePlaylists.map((pl) => {
                  const isHindi = pl.name?.toLowerCase().includes('hindi');
                  const isTelugu = pl.name?.toLowerCase().includes('telugu');
                  const isEnglish = pl.name?.toLowerCase().includes('english');
                  const isRecommended = pl.name?.toLowerCase().includes('recommended');
                  const accentColor = isHindi ? '#FF6B6B' : isTelugu ? '#FFD700' : isEnglish ? '#4FC3F7' : isRecommended ? '#1DB954' : '#9B59B6';
                  const coverSrc = pl.coverImage || pl.previewSongs?.[0]?.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300';
                  return (
                    <Link
                      key={pl.id}
                      href={`/playlist/${pl.id}`}
                      className="group flex items-center justify-between p-4 bg-brandElevated hover:bg-brandHighlight border border-brandHighlight rounded-xl transition-all shadow-lg"
                      style={{ borderColor: accentColor + '22' }}
                    >
                      <div className="flex items-center gap-4 flex-1 truncate">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                          <img
                            src={coverSrc}
                            alt={pl.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300'; }}
                          />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-base truncate text-white group-hover:text-spotifyGreen transition-colors">{pl.name}</p>
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full hidden sm:inline" style={{ background: accentColor + '22', color: accentColor }}>
                              {isHindi ? '🇮🇳' : isTelugu ? '🎬' : isEnglish ? '🌍' : isRecommended ? '⭐' : '🎵'}
                            </span>
                          </div>
                          <p className="text-xs text-brandMuted truncate">{pl.songCount} songs</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section C: Custom Playlists */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Disc className="w-5 h-5 text-brandNeon animate-spin-slow" />
              Your Custom Playlists
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {playlists.map((pl) => {
                const playlistCover = pl.songs && pl.songs.length > 0 ? pl.songs[0].coverImage : null;
                return (
                  <div
                    key={pl.id}
                    className="group flex items-center justify-between p-4 bg-brandElevated hover:bg-brandHighlight border border-brandHighlight hover:border-brandNeon/20 rounded-xl transition-all cursor-pointer shadow-lg"
                  >
                    <Link href={`/playlist/${pl.id}`} className="flex items-center gap-4 flex-1 truncate">
                      {playlistCover ? (
                        <img
                          src={playlistCover}
                          alt={pl.name}
                          className="w-16 h-16 rounded-lg object-cover shadow-md border border-brandHighlight flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-brandDarkGray flex items-center justify-center shadow-md border border-brandHighlight flex-shrink-0">
                          <Music className="w-6 h-6 text-brandMuted" />
                        </div>
                      )}
                      <div className="truncate">
                        <p className="font-semibold text-base truncate text-brandWhite group-hover:text-brandNeon transition-colors">
                          {pl.name}
                        </p>
                        <p className="text-xs text-brandMuted truncate">
                          {pl.songCount || pl.songs?.length || 0} Songs
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => handlePlayPlaylist(e, pl)}
                        disabled={!pl.songs || pl.songs.length === 0}
                        className="w-10 h-10 rounded-full bg-brandNeon text-brandBg flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:scale-105 active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-brandBg ml-0.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeletePlaylist(e, pl.id, pl.name)}
                        className="text-brandMuted hover:text-red-500 transition-colors p-2 rounded hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {playlists.length === 0 && (
                <div className="col-span-2 flex flex-col items-center justify-center p-12 border border-dashed border-brandHighlight/40 rounded-xl bg-[#0d0d0d]/40">
                  <Music className="w-10 h-10 text-brandMuted mb-2" />
                  <p className="text-sm font-semibold">No playlists created yet</p>
                  <p className="text-xs text-brandMuted">Click "Create Playlist" in the sidebar to get started!</p>
                </div>
              )}
            </div>
          </section>

        </div>
      )}

      {/* 5. Elegant Spotify Link Authorization Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
          <div 
            className="w-full max-w-md bg-brandElevated border border-brandHighlight p-6 rounded-2xl shadow-2xl relative space-y-6 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-[#1DB954]/20 text-[#1DB954] rounded-full flex items-center justify-center mx-auto shadow-md">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.3 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.3z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-brandWhite">Connect Spotify Account</h3>
              <p className="text-xs text-brandMuted">
                Import playlists and listen to millions of track previews.
              </p>
            </div>

            <div className="space-y-4">
              {/* Option 1: Quick connect */}
              <button
                onClick={handleSimulatedConnect}
                className="w-full py-3 bg-brandNeon hover:brightness-110 text-brandBg font-black rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-md"
              >
                Quick Connect (Simulated Sandbox)
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-brandHighlight"></div>
                <span className="flex-shrink mx-4 text-[10px] text-brandMuted font-extrabold uppercase">OR CONNECT TO LIVE API</span>
                <div className="flex-grow border-t border-brandHighlight"></div>
              </div>

              {/* Option 2: Live API credentials */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-brandMuted uppercase tracking-wider block">
                  Spotify Client ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave blank to use default Client ID"
                  value={customClientId}
                  onChange={(e) => setCustomClientId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brandDarkGray border border-brandHighlight focus:border-[#1DB954] text-xs rounded-xl focus:outline-none text-brandWhite placeholder-brandMuted/50 font-medium transition-colors"
                />
              </div>

              <button
                onClick={handleRealConnect}
                className="w-full py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-black rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-md"
              >
                Authenticate with Spotify
              </button>
            </div>

            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="w-full py-2.5 text-xs text-brandMuted hover:text-brandWhite transition-colors font-bold uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
