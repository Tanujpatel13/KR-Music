'use client';

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  togglePlay,
  playNext,
  playPrevious,
  setProgress,
  setDuration,
  setVolume,

  toggleMute,
  toggleShuffle,
  toggleRepeat,
  toggleLyrics,
  setPlaying,
  toggleLikeSong,
  setLikedSongs,
  setHistory,
  toggleNowPlaying,
  setFullscreenPlayerOpen,
  tickSleepTimer,
} from '../store/playerSlice';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Mic2,
  Maximize2,
  Heart,
  Plus,
  Disc,
} from 'lucide-react';

export default function PlayerBar() {
  const dispatch = useDispatch();
  const player = useSelector((state: RootState) => state.player);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isPlaylistDropdownOpen, setIsPlaylistDropdownOpen] = useState(false);
  const [localProgress, setLocalProgress] = useState(player.progress);
  const [isSeeking, setIsSeeking] = useState(false);

  // Sync progress
  useEffect(() => {
    if (!isSeeking) {
      setLocalProgress(player.progress);
    }
  }, [player.progress, isSeeking]);

  // Load liked songs, playback history, and custom playlists from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLikes = localStorage.getItem('likedSongs');
      if (savedLikes) {
        try {
          dispatch(setLikedSongs(JSON.parse(savedLikes)));
        } catch (e) {
          console.error('Failed to parse liked songs:', e);
        }
      }

      const savedHistory = localStorage.getItem('playbackHistory');
      if (savedHistory) {
        try {
          dispatch(setHistory(JSON.parse(savedHistory)));
        } catch (e) {
          console.error('Failed to parse playback history:', e);
        }
      }

      const loadPlaylists = () => {
        const savedPlaylists = localStorage.getItem('customPlaylists');
        if (savedPlaylists) {
          setPlaylists(JSON.parse(savedPlaylists));
        }
      };
      loadPlaylists();
      window.addEventListener('playlists-updated', loadPlaylists);
      return () => window.removeEventListener('playlists-updated', loadPlaylists);
    }
  }, [dispatch]);

  const handleAddCurrentSongToPlaylist = (playlistId: string) => {
    if (!player.currentSong) return;
    const song = player.currentSong;

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('customPlaylists');
      const playlistsList = saved ? JSON.parse(saved) : [];

      const songToAdd = {
        id: song.id,
        name: song.name,
        duration: song.duration,
        coverImage: song.coverImage,
        audioUrl: song.audioUrl,
        artist: typeof song.artist === 'string' ? { id: 'a5', name: song.artist } : song.artist || { id: 'a5', name: 'Unknown' },
        album: song.album || null
      };

      const updated = playlistsList.map((pl: any) => {
        if (String(pl.id) === String(playlistId)) {
          const exists = pl.songs.some((s: any) => s.id === song.id);
          if (!exists) {
            return { ...pl, songs: [...pl.songs, songToAdd] };
          }
        }
        return pl;
      });

      localStorage.setItem('customPlaylists', JSON.stringify(updated));
      window.dispatchEvent(new Event('playlists-updated'));
      alert(`Added "${song.name}" to playlist!`);
    }
  };

  const isCurrentSongLiked = player.currentSong
    ? player.likedSongs.some((s) => s.id === player.currentSong!.id)
    : false;

  const isPlayingRef = useRef(player.isPlaying);
  useEffect(() => {
    isPlayingRef.current = player.isPlaying;
  }, [player.isPlaying]);

  const safePlay = (audio: HTMLAudioElement) => {
    audio.play().catch((err) => {
      if (err.name !== 'AbortError') {
        console.warn('Playback block or error:', err);
        dispatch(setPlaying(false));
      }
    });
  };

  // Synchronize playback state
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    if (typeof window !== 'undefined') {
      (window as any).audioElement = audio;
    }

    const onTimeUpdate = () => {
      dispatch(setProgress(audio.currentTime));
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        dispatch(setDuration(audio.duration));
      }
    };

    const onEnded = () => {
      dispatch(playNext());
    };

    const onCanPlay = () => {
      if (isPlayingRef.current) {
        safePlay(audio);
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('canplay', onCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('canplay', onCanPlay);
    };

  }, [dispatch]);

  // Handle Song Change
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && player.currentSong) {
      let playUrl = player.currentSong.audioUrl;
      if (playUrl.startsWith('/api/')) {
        playUrl = `${playUrl}`;
      }
      audio.src = playUrl;
      audio.load();
      if (player.isPlaying) {
        safePlay(audio);
      }
    }
  }, [player.currentSong, player.playTrigger, dispatch]);

  // Handle Play/Pause triggers
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && player.currentSong) {
      if (player.isPlaying) {
        safePlay(audio);
      } else {
        audio.pause();
      }
    }
  }, [player.isPlaying, dispatch]);

  // Handle Volume triggers
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = player.isMuted ? 0 : player.volume;
    }
  }, [player.volume, player.isMuted]);

  // Sleep Timer Countdown Ticker
  useEffect(() => {
    let intervalId: any;
    if (player.isPlaying && player.sleepTimerTimeLeft !== null) {
      intervalId = setInterval(() => {
        dispatch(tickSleepTimer());
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [player.isPlaying, player.sleepTimerTimeLeft, dispatch]);

  if (!player.currentSong) return null;

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalProgress(parseFloat(e.target.value));
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
    if (audioRef.current) {
      audioRef.current.currentTime = localProgress;
    }
    dispatch(setProgress(localProgress));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <>
      {/* Desktop Player Bar */}
      <div className={`hidden md:flex h-24 bg-[#141414]/85 backdrop-blur-xl border-t border-white/5 px-6 items-center justify-between text-brandWhite select-none fixed bottom-0 left-0 right-0 z-50 ${player.isFullscreenPlayerOpen ? '!hidden' : ''} shadow-[0_-8px_30px_rgba(0,0,0,0.5)]`}>
        {/* 1. Track Info metadata */}
        <div className="flex items-center gap-4 w-1/3">
          <div
            onClick={() => dispatch(setFullscreenPlayerOpen(true))}
            className="flex items-center gap-4 cursor-pointer hover:opacity-85 transition-opacity truncate"
            title="Open Fullscreen Player"
          >
            {player.currentSong.coverImage === 'collage' ? (
              <div className="w-14 h-14 rounded-md overflow-hidden grid grid-cols-2 grid-rows-2 gap-0.5 bg-[#121212] flex-shrink-0 border border-white/5 shadow-md">
                <img src="/static/images/ye_maaya_chesave.jpg" className="w-full h-full object-cover" />
                <img src="/static/images/rangasthalam.jpg" className="w-full h-full object-cover" />
                <img src="/static/images/hi_nanna.jpg" className="w-full h-full object-cover" />
                <img src="/static/images/magadheera.jpg" className="w-full h-full object-cover" />
              </div>
            ) : (
              <img
                src={player.currentSong.coverImage}
                alt={player.currentSong.name}
                className="w-14 h-14 rounded-md object-cover flex-shrink-0 shadow-lg"
              />
            )}
            <div className="flex items-center gap-2.5 truncate">
              <div className="truncate">
                <h4 className="text-sm font-bold text-brandWhite hover:underline truncate flex items-center gap-2">
                  {player.currentSong.name}
                  {player.isPlaying && (
                    <div className="mini-equalizer flex-shrink-0" title="Playing">
                      <div className="mini-equalizer-bar" />
                      <div className="mini-equalizer-bar" />
                      <div className="mini-equalizer-bar" />
                      <div className="mini-equalizer-bar" />
                    </div>
                  )}
                </h4>
                <p className="text-xs text-brandMuted hover:underline truncate mt-0.5">
                  {player.currentSong.artist.name}
                </p>
              </div>
            </div>
          </div>
          
          {/* Like Button */}
          <button
            onClick={() => player.currentSong && dispatch(toggleLikeSong(player.currentSong))}
            className={`transition-transform duration-200 active:scale-125 ${
              isCurrentSongLiked ? 'text-spotifyGreen' : 'text-brandMuted hover:text-brandWhite'
            }`}
          >
            <Heart className={`w-5 h-5 ${isCurrentSongLiked ? 'fill-spotifyGreen text-spotifyGreen' : ''}`} />
          </button>

          {/* Playlist Add Button Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPlaylistDropdownOpen(!isPlaylistDropdownOpen)}
              className={`p-1 rounded-full hover:bg-[#282828] transition-all ${
                isPlaylistDropdownOpen ? 'text-spotifyGreen' : 'text-brandMuted hover:text-brandWhite'
              }`}
              title="Add playing song to playlist"
            >
              <Plus className="w-5 h-5" />
            </button>
            
            {isPlaylistDropdownOpen && (
              <div className="absolute left-0 bottom-full mb-3 w-48 bg-[#282828] border border-white/5 rounded-lg shadow-xl z-50 p-2 text-left space-y-1">
                <p className="text-[10px] uppercase font-bold text-brandMuted px-2 py-1">Add to Playlist</p>
                <div className="max-h-32 overflow-y-auto scrollbar-none">
                  {playlists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() => {
                        handleAddCurrentSongToPlaylist(pl.id);
                        setIsPlaylistDropdownOpen(false);
                      }}
                      className="w-full text-left text-xs text-brandWhite hover:text-[#121212] hover:bg-spotifyGreen py-1.5 px-2 rounded font-medium transition-all truncate"
                    >
                      {pl.name}
                    </button>
                  ))}
                  {playlists.length === 0 && (
                    <p className="text-[10px] text-brandMuted italic px-2 py-1">No playlists. Create one in sidebar!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
  
        {/* 2. Playback Core Controls */}
        <div className="flex flex-col items-center gap-2 w-1/3 max-w-xl flex-1 md:flex-none">
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={() => dispatch(toggleShuffle())}
              className={`transition-colors hidden md:block ${player.isShuffle ? 'text-spotifyGreen' : 'text-brandMuted hover:text-brandWhite'}`}
            >
              <Shuffle className="w-5 h-5" />
            </button>
            <button onClick={() => dispatch(playPrevious())} className="text-brandMuted hover:text-brandWhite transition-colors">
              <SkipBack className="w-5 h-5 fill-brandWhite text-brandWhite" />
            </button>
            <button
              onClick={() => dispatch(togglePlay())}
              className="w-8 h-8 rounded-full bg-brandWhite text-[#121212] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            >
              {player.isPlaying ? <Pause className="w-5 h-5 fill-[#121212] text-[#121212]" /> : <Play className="w-5 h-5 fill-[#121212] text-[#121212] ml-0.5" />}
            </button>
            <button onClick={() => dispatch(playNext({ force: true }))} className="text-brandMuted hover:text-brandWhite transition-colors">
              <SkipForward className="w-5 h-5 fill-brandWhite text-brandWhite" />
            </button>
            <button
              onClick={() => dispatch(toggleRepeat())}
              className={`transition-colors hidden md:block ${player.repeatMode !== 'none' ? 'text-spotifyGreen' : 'text-brandMuted hover:text-brandWhite'}`}
              title={`Repeat: ${player.repeatMode}`}
            >
              {player.repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>
          </div>
  
          {/* Playback Seek Bar with Glowing Dynamic Gradient Fill Tracker */}
          <div className="flex items-center gap-3 w-full text-xs text-brandMuted select-none">
            <span className="w-9 text-right font-mono text-[11px] text-brandWhite/80">{formatTime(localProgress)}</span>
            <div className="relative flex-1 flex items-center group">
              <input
                type="range"
                min={0}
                max={player.duration || 100}
                step={0.1}
                value={localProgress}
                onMouseDown={handleSeekStart}
                onTouchStart={handleSeekStart}
                onChange={handleSeekChange}
                onMouseUp={handleSeekEnd}
                onTouchEnd={handleSeekEnd}
                style={{
                  background: `linear-gradient(to right, #1db954 0%, #1db954 ${Math.min(100, Math.max(0, (localProgress / (player.duration || 1)) * 100))}%, rgba(255, 255, 255, 0.15) ${Math.min(100, Math.max(0, (localProgress / (player.duration || 1)) * 100))}%, rgba(255, 255, 255, 0.15) 100%)`
                }}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer hover:h-2 transition-all shadow-inner"
              />
            </div>
            <span className="w-9 text-left font-mono text-[11px] text-brandMuted">{formatTime(player.duration)}</span>
          </div>

        </div>
  
        {/* 3. Auxiliary Settings Controls */}
        <div className="hidden md:flex items-center justify-end gap-4 w-1/3">
          <button
            onClick={() => dispatch(toggleNowPlaying())}
            className={`transition-colors ${player.isNowPlayingOpen ? 'text-spotifyGreen font-bold' : 'text-brandMuted hover:text-brandWhite'}`}
            title="Now Playing View"
          >
            <Disc className={`w-5 h-5 ${player.isNowPlayingOpen && player.isPlaying ? 'animate-spin-slow' : ''}`} />
          </button>
          <button
            onClick={() => dispatch(toggleLyrics())}
            className={`transition-colors ${player.showLyrics ? 'text-spotifyGreen' : 'text-brandMuted hover:text-brandWhite'}`}
          >
            <Mic2 className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => dispatch(toggleMute())} className="text-brandMuted hover:text-brandWhite transition-colors">
              {player.isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={player.isMuted ? 0 : player.volume}
              onChange={(e) => dispatch(setVolume(parseFloat(e.target.value)))}
              className="w-20 accent-spotifyGreen h-1 bg-[#282828] rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <button className="text-brandMuted hover:text-brandWhite transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Mini Player Floating Card */}
      <div 
        onClick={() => dispatch(setFullscreenPlayerOpen(true))}
        className={`md:hidden h-16 bg-[#141414]/90 backdrop-blur-xl border border-white/10 mx-3 rounded-2xl flex items-center justify-between px-4 z-40 fixed bottom-[4.5rem] left-0 right-0 active:scale-95 transition-all duration-300 cursor-pointer shadow-[0_12px_24px_rgba(0,0,0,0.6)] ${player.isFullscreenPlayerOpen ? '!hidden' : ''}`}
      >
        <div className="flex items-center gap-3 truncate max-w-[70%]">
          {player.currentSong.coverImage === 'collage' ? (
            <div className="w-10 h-10 rounded-lg overflow-hidden grid grid-cols-2 grid-rows-2 gap-0.5 bg-[#121212] flex-shrink-0 border border-white/5 shadow-md">
              <img src="/static/images/ye_maaya_chesave.jpg" className="w-full h-full object-cover" />
              <img src="/static/images/rangasthalam.jpg" className="w-full h-full object-cover" />
              <img src="/static/images/hi_nanna.jpg" className="w-full h-full object-cover" />
              <img src="/static/images/magadheera.jpg" className="w-full h-full object-cover" />
            </div>
          ) : (
            <img
              src={player.currentSong.coverImage}
              alt=""
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow-md"
            />
          )}
          <div className="truncate">
            <p className="text-xs font-bold text-brandWhite truncate flex items-center gap-1.5">
              {player.currentSong.name}
              {player.isPlaying && (
                <div className="mini-equalizer flex-shrink-0" title="Playing">
                  <div className="mini-equalizer-bar" />
                  <div className="mini-equalizer-bar" />
                  <div className="mini-equalizer-bar" />
                  <div className="mini-equalizer-bar" />
                </div>
              )}
            </p>
            <p className="text-[10px] text-brandMuted truncate mt-0.5">{player.currentSong.artist.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(toggleLikeSong(player.currentSong!));
            }}
            className={`p-1.5 active:scale-125 transition-transform ${isCurrentSongLiked ? 'text-spotifyGreen' : 'text-brandMuted'}`}
          >
            <Heart className={`w-5 h-5 ${isCurrentSongLiked ? 'fill-spotifyGreen text-spotifyGreen' : ''}`} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(togglePlay());
            }}
            className="w-9 h-9 rounded-full bg-brandWhite text-[#121212] flex items-center justify-center active:scale-90 transition-transform"
          >
            {player.isPlaying ? (
              <Pause className="w-4 h-4 fill-[#121212] text-[#121212]" />
            ) : (
              <Play className="w-4 h-4 fill-[#121212] text-[#121212] ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
