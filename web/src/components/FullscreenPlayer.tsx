'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  setFullscreenPlayerOpen,
  togglePlay,
  playNext,
  playPrevious,
  setProgress,
  setVolume,
  toggleMute,
  toggleShuffle,
  toggleRepeat,
  toggleLikeSong,

  setSleepTimer,
} from '../store/playerSlice';
import {
  ChevronDown,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  Music,
  Share2,
  Clock,
} from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

export default function FullscreenPlayer() {
  const dispatch = useDispatch();
  const player = useSelector((state: RootState) => state.player);
  const { currentSong, isPlaying, isFullscreenPlayerOpen, duration, progress, volume, isMuted, isShuffle, isRepeat, likedSongs } = player;

  const [localProgress, setLocalProgress] = useState(progress);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showLyricsDrawer, setShowLyricsDrawer] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);

  // Sync progress
  useEffect(() => {
    if (!isSeeking) {
      setLocalProgress(progress);
    }
  }, [progress, isSeeking]);

  if (!isFullscreenPlayerOpen || !currentSong) return null;

  const isLiked = likedSongs.some((s) => s.id === currentSong.id);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatSleepTime = (secs: number | null) => {
    if (secs === null) return '';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalProgress(parseFloat(e.target.value));
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);

    // Dispatch to audio player
    if (typeof window !== 'undefined' && (window as any).audioElement) {
      (window as any).audioElement.currentTime = localProgress;
    } else {
      const audioElements = document.getElementsByTagName('audio');
      if (audioElements.length > 0) {
        audioElements[0].currentTime = localProgress;
      }
    }
    dispatch(setProgress(localProgress));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    dispatch(setVolume(val));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentSong.name,
        text: `Listening to ${currentSong.name} by ${currentSong.artist.name} on KR Music!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/?play=${currentSong.id}`);
      alert('Track link copied to clipboard!');
    }
  };

  const mockLyrics = `[00:12] Neon Pulse, it guides the way\n[00:24] Till the night turns into day\n[00:36] In the melody we find\n[00:48] Peace of body and of mind\n[01:00] Play the rhythm, feel the glow\n[01:12] Let the music overflow\n[01:24] KR Music is the sound\n[01:36] Highest quality all around`;

  const parsedLyrics = mockLyrics.split('\n').map((line) => {
    const match = line.match(/^\[(\d{2}):(\d{2})\]/);
    if (match) {
      const mins = parseInt(match[1], 10);
      const secs = parseInt(match[2], 10);
      return {
        time: mins * 60 + secs,
        text: line.replace(/^\[\d{2}:\d{2}\]\s*/, ''),
      };
    }
    return { time: 0, text: line };
  });

  return (
    <div className="fixed inset-0 bg-[#070707] z-55 flex flex-col justify-between text-brandWhite select-none overflow-hidden animate-slide-up">
      {/* 1. Ambient Blurred Backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {currentSong.coverImage === 'collage' ? (
          <div className="w-full h-full bg-[#121212] opacity-30 filter blur-3xl scale-125" />
        ) : (
          <img
            src={currentSong.coverImage}
            alt=""
            className="w-full h-full object-cover opacity-25 filter blur-[100px] scale-150 transform-gpu"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-[#0b0b0b]/80 to-[#070707]" />
      </div>

      {/* 2. Top Navigation Header */}
      <header className="relative z-60 px-6 py-6 flex items-center justify-between">
        <button
          onClick={() => dispatch(setFullscreenPlayerOpen(false))}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-brandMuted hover:text-brandWhite transition-colors"
          title="Minimize"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center truncate max-w-[60%]">
          <p className="text-[10px] uppercase tracking-widest font-extrabold text-brandNeon">PLAYING FROM</p>
          <h2 className="text-xs font-bold text-brandWhite/80 truncate">
            {currentSong.album?.name || 'Single'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Sleep Timer Countdown & Trigger */}
          <div className="relative z-50">
            <button
              onClick={() => setShowSleepMenu(!showSleepMenu)}
              className={`p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all flex items-center gap-1.5 ${player.sleepTimerTimeLeft !== null ? 'text-brandNeon border border-brandNeon/30' : 'text-brandMuted hover:text-brandWhite'
                }`}
              title="Sleep Timer"
            >
              <Clock className="w-5 h-5" />
              {player.sleepTimerTimeLeft !== null && (
                <span className="text-[10px] font-black">{formatSleepTime(player.sleepTimerTimeLeft)}</span>
              )}
            </button>
            {showSleepMenu && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-brandHighlight border border-brandHighlight rounded-xl shadow-2xl z-60 p-2 space-y-1">
                <p className="text-[10px] uppercase font-bold text-brandMuted px-2 py-1 text-left">Sleep Timer</p>
                {[
                  { label: 'Off', value: null },
                  { label: '5 Mins', value: 5 },
                  { label: '10 Mins', value: 10 },
                  { label: '15 Mins', value: 15 },
                  { label: '30 Mins', value: 30 },
                  { label: '45 Mins', value: 45 },
                  { label: '60 Mins', value: 60 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      dispatch(setSleepTimer(opt.value));
                      setShowSleepMenu(false);
                    }}
                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded font-medium transition-all truncate ${player.sleepTimerMinutes === opt.value
                      ? 'bg-brandNeon text-brandBg font-bold'
                      : 'text-brandWhite hover:text-brandBg hover:bg-brandNeon'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-brandMuted hover:text-brandWhite transition-colors"
            title="Share Song"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 3. Cover Art Box */}
      <div className="relative z-0 flex-1 flex flex-col items-center justify-center px-8 py-4">
        <div
          className={`relative aspect-square w-full max-w-[280px] sm:max-w-[340px] rounded-2xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border border-white/10 bg-brandDarkGray transition-transform duration-700 ${isPlaying ? 'scale-100 ring-2 ring-brandNeon/30' : 'scale-95 opacity-80'
            }`}
        >
          {currentSong.coverImage === 'collage' ? (
            <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5 bg-brandDarkGray">
              <img src="/static/images/ye_maaya_chesave.jpg" className="w-full h-full object-cover" />
              <img src="/static/images/rangasthalam.jpg" className="w-full h-full object-cover" />
              <img src="/static/images/hi_nanna.jpg" className="w-full h-full object-cover" />
              <img src="/static/images/magadheera.jpg" className="w-full h-full object-cover" />
            </div>
          ) : (
            <img
              src={currentSong.coverImage}
              alt={currentSong.name}
              className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
              style={{ animationDuration: '40s' }}
            />
          )}
        </div>
      </div>

      {/* 4. Controls Area (Bottom HUD) */}
      <div className="relative z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent px-6 pb-8 space-y-6 flex-shrink-0">

        {/* Track Details & Heart Toggle */}
        <div className="flex items-center justify-between">
          <div className="truncate pr-4">
            <h1 className="text-2xl font-black tracking-tight text-brandWhite truncate drop-shadow-md">
              {currentSong.name}
            </h1>
            <p className="text-sm text-brandMuted font-bold hover:underline cursor-pointer truncate mt-0.5">
              {currentSong.artist.name}
            </p>
          </div>

          <button
            onClick={() => dispatch(toggleLikeSong(currentSong))}
            className={`p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-transform duration-200 active:scale-125 ${isLiked ? 'text-brandNeon' : 'text-brandMuted hover:text-brandWhite'
              }`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-brandNeon text-brandNeon' : ''}`} />
          </button>
        </div>

        {/* Progress Bar & Markers with Glowing Dynamic Gradient Fill Tracker */}
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={localProgress}
            onMouseDown={handleSeekStart}
            onTouchStart={handleSeekStart}
            onChange={handleSeekChange}
            onMouseUp={handleSeekEnd}
            onTouchEnd={handleSeekEnd}
            style={{
              background: `linear-gradient(to right, #1db954 0%, #1db954 ${Math.min(100, Math.max(0, (localProgress / (duration || 1)) * 100))}%, rgba(255, 255, 255, 0.15) ${Math.min(100, Math.max(0, (localProgress / (duration || 1)) * 100))}%, rgba(255, 255, 255, 0.15) 100%)`
            }}
            className="w-full h-2 rounded-full appearance-none cursor-pointer hover:h-2.5 transition-all shadow-md"
          />
          <div className="flex items-center justify-between text-xs text-brandMuted font-mono">
            <span>{formatTime(localProgress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>


        {/* Core Media Keys (Tactile Controls) */}
        <div className="flex items-center justify-between px-4">
          <button
            onClick={() => dispatch(toggleShuffle())}
            className={`p-2 transition-colors ${isShuffle ? 'text-brandNeon' : 'text-brandMuted hover:text-brandWhite'}`}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={() => dispatch(playPrevious())}
            className="p-3 bg-white/5 hover:bg-white/10 text-brandWhite rounded-full transition-transform active:scale-90"
            title="Previous Song"
          >
            <SkipBack className="w-6 h-6 fill-brandWhite" />
          </button>

          {/* Huge Glowing Play/Pause Center Key */}
          <button
            onClick={() => dispatch(togglePlay())}
            className="w-20 h-20 bg-brandWhite text-brandBg rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(29,185,84,0.3)] hover:scale-105 active:scale-95 transition-all relative group"
            title="Play / Pause"
          >
            <div className="absolute inset-0 rounded-full bg-brandNeon opacity-0 group-hover:opacity-20 blur-md transition-opacity" />
            {isPlaying ? (
              <Pause className="w-9 h-9 fill-brandBg text-brandBg" />
            ) : (
              <Play className="w-9 h-9 fill-brandBg text-brandBg ml-1" />
            )}
          </button>

          <button
            onClick={() => dispatch(playNext({ force: true }))}
            className="p-3 bg-white/5 hover:bg-white/10 text-brandWhite rounded-full transition-transform active:scale-90"
            title="Next Song"
          >
            <SkipForward className="w-6 h-6 fill-brandWhite" />
          </button>

          <button
            onClick={() => dispatch(toggleRepeat())}
            className={`p-2 transition-colors ${player.repeatMode !== 'none' ? 'text-brandNeon' : 'text-brandMuted hover:text-brandWhite'}`}
            title={`Repeat: ${player.repeatMode}`}
          >
            {player.repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Volume & Drawer Toggles */}
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={() => dispatch(toggleMute())}
            className="text-brandMuted hover:text-brandWhite transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="flex-1 accent-brandNeon h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Swipeable Drawer Lyrics Snippet */}
        <div
          onClick={() => setShowLyricsDrawer(true)}
          className="group/lyrics bg-white/5 hover:bg-white/10 border border-white/5 p-4 rounded-xl cursor-pointer transition-all flex flex-col gap-2 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-brandNeon">
            <span className="flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5" />
              Lyrics Drawer
            </span>
            <span className="text-brandMuted group-hover/lyrics:text-brandNeon transition-colors">
              Tap to Expand
            </span>
          </div>

          <div className="text-sm text-brandWhite/90 leading-relaxed font-semibold line-clamp-1 italic text-brandMuted">
            Neon Pulse, it guides the way... (Tap to read full lyrics)
          </div>
        </div>
      </div>

      {/* Bottom Sheet Lyrics Panel */}
      <div
        className={`fixed inset-x-0 bottom-0 bg-[#0c0c0cd9] backdrop-blur-xl border-t border-white/10 rounded-t-[32px] z-50 flex flex-col transition-all duration-500 transform-gpu ${showLyricsDrawer ? 'translate-y-0 h-[70vh]' : 'translate-y-full h-0'
          }`}
      >
        {/* Drag Handle Indicator */}
        <div
          className="w-full flex justify-center py-4 cursor-pointer"
          onClick={() => setShowLyricsDrawer(false)}
        >
          <div className="w-12 h-1.5 bg-white/20 rounded-full hover:bg-white/40 transition-colors" />
        </div>

        {/* Header */}
        <div className="px-8 pb-4 flex justify-between items-center border-b border-white/5">
          <div>
            <h3 className="text-lg font-black text-brandWhite">Lyrics</h3>
            <p className="text-xs text-brandMuted font-medium truncate max-w-[250px]">
              {currentSong.name} - {currentSong.artist.name}
            </p>
          </div>
          <button
            onClick={() => setShowLyricsDrawer(false)}
            className="text-xs font-bold text-brandNeon hover:underline"
          >
            Close
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scrollbar-thin select-text">
          {parsedLyrics.map((line, idx) => {
            const nextLine = parsedLyrics[idx + 1];
            const isActive = progress >= line.time && (!nextLine || progress < nextLine.time);

            return (
              <p
                key={idx}
                className={`text-xl font-bold transition-all duration-300 leading-relaxed ${isActive
                  ? 'text-brandNeon scale-105 origin-left drop-shadow-[0_0_8px_rgba(29,185,84,0.4)]'
                  : 'text-brandWhite/45 hover:text-brandWhite/80'
                  }`}
              >
                {line.text}
              </p>
            );
          })}
          <div className="pt-8 text-center text-xs text-brandMuted font-light pb-12">
            Lyrics synced by KR Music Sync Engine
          </div>
        </div>
      </div>
    </div>
  );
}
