'use client';

import { X, Play, Pause, Disc, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setAlbumPanelOpen, setSong, setQueue, togglePlay } from '../store/playerSlice';

export default function SlidingAlbumPanel() {
  const dispatch = useDispatch();
  const player = useSelector((state: RootState) => state.player);
  const router = useRouter();
  const { activeAlbum, isAlbumPanelOpen, currentSong, isPlaying } = player;

  if (!activeAlbum) return null;

  const handleAlbumClick = () => {
    dispatch(setAlbumPanelOpen(false));
    router.push(`/album/${activeAlbum.id}`);
  };

  const handlePlaySong = (song: any) => {
    if (currentSong?.id === song.id) {
      dispatch(togglePlay());
    } else {
      // Find track metadata with correct formats
      const selectedSong = {
        ...song,
        coverImage: song.coverImage || activeAlbum.coverImage,
        artist: typeof song.artist === 'string' ? { id: 'a5', name: song.artist } : song.artist || { id: 'a5', name: activeAlbum.artist },
        album: { id: activeAlbum.id, name: activeAlbum.name }
      };
      dispatch(setSong(selectedSong));
      
      // Setup queue with other songs in the album
      const clickedIndex = activeAlbum.songs.findIndex((s: any) => s.id === song.id);
      const finalIndex = clickedIndex !== -1 ? clickedIndex : 0;
      const otherSongs = activeAlbum.songs
        .slice(finalIndex + 1)
        .map((s: any) => ({
          ...s,
          coverImage: s.coverImage || activeAlbum.coverImage,
          artist: typeof s.artist === 'string' ? { id: 'a5', name: s.artist } : s.artist || { id: 'a5', name: activeAlbum.artist },
          album: { id: activeAlbum.id, name: activeAlbum.name }
        }));
      dispatch(setQueue(otherSongs));
    }
  };

  return (
    <div
      className={`fixed top-0 bottom-24 right-0 w-full sm:w-96 bg-brandBg border-l border-brandElevated z-40 flex flex-col transition-transform duration-300 ease-in-out transform-gpu shadow-2xl ${
        isAlbumPanelOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ willChange: 'transform' }}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 border-b border-brandElevated">
        <div className="flex items-center gap-2 text-brandMuted text-xs uppercase tracking-wider font-bold">
          <Disc className="w-4 h-4 text-brandNeon animate-spin-slow" />
          <span>Album Quick View</span>
        </div>
        <button
          onClick={() => dispatch(setAlbumPanelOpen(false))}
          className="p-1 rounded-full text-brandMuted hover:text-brandWhite hover:bg-brandElevated transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Album Artwork & Details Container */}
      <div className="flex flex-col items-center p-6 text-center border-b border-brandElevated bg-gradient-to-b from-brandElevated to-brandBg">
        <div className="relative cursor-pointer group" onClick={handleAlbumClick} title="View Full Album Page">
          {activeAlbum.coverImage === 'collage' ? (
            <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-xl overflow-hidden grid grid-cols-2 grid-rows-2 gap-0.5 bg-brandDarkGray mb-4 shadow-2xl border border-brandHighlight animate-fade-in group-hover:scale-[1.03] transition-transform duration-300">
              <img src="/static/images/ye_maaya_chesave.jpg" className="w-full h-full object-cover" />
              <img src="/static/images/rangasthalam.jpg" className="w-full h-full object-cover" />
              <img src="/static/images/hi_nanna.jpg" className="w-full h-full object-cover" />
              <img src="/static/images/magadheera.jpg" className="w-full h-full object-cover" />
            </div>
          ) : (
            <img
              src={activeAlbum.coverImage}
              alt={activeAlbum.name}
              className="w-36 h-36 sm:w-40 sm:h-40 rounded-xl object-cover shadow-2xl border border-brandHighlight mb-4 animate-fade-in group-hover:scale-[1.03] transition-transform duration-300"
            />
          )}
          {/* Hover overlay with "View Album" hint */}
          <div className="absolute inset-0 mb-4 rounded-xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2 bg-brandBg/80 px-3 py-1.5 rounded-full border border-brandNeon/50">
              <ExternalLink className="w-3.5 h-3.5 text-brandNeon" />
              <span className="text-xs font-bold text-brandNeon uppercase tracking-wider">View Album</span>
            </div>
          </div>
        </div>
        <h3 className="font-extrabold text-lg text-brandWhite truncate max-w-full px-2 hover:text-brandNeon cursor-pointer transition-colors" onClick={handleAlbumClick}>
          {activeAlbum.name}
        </h3>
        <p className="text-xs text-brandNeon font-semibold mb-2">{(activeAlbum.artist as any)?.name || activeAlbum.artist}</p>
        <p className="text-[10px] text-brandMuted uppercase tracking-wider">
          {activeAlbum.releaseYear} &bull; {activeAlbum.songs.length} Tracks
        </p>
      </div>

      {/* Scrollable Song List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
        {activeAlbum.songs.map((song: any, index: number) => {
          const isCurrentPlay = currentSong?.id === song.id;
          const isThisPlaying = isCurrentPlay && isPlaying;

          return (
            <div
              key={song.id}
              onClick={() => handlePlaySong(song)}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group select-none ${
                isCurrentPlay
                  ? 'bg-brandNeon/10 border-brandNeon/30'
                  : 'bg-brandDarkGray border-brandHighlight hover:border-brandNeon/30 hover:bg-brandElevated'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <span className={`text-xs font-bold w-4 text-center ${isCurrentPlay ? 'text-brandNeon' : 'text-brandMuted'}`}>
                  {index + 1}
                </span>
                <div className="truncate">
                  <p className={`text-xs font-semibold truncate ${isCurrentPlay ? 'text-brandNeon' : 'text-brandWhite'}`}>
                    {song.name}
                  </p>
                  <p className="text-[10px] text-brandMuted truncate">
                    {song.artist?.name || activeAlbum.artist}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlaySong(song);
                }}
                className={`w-7 h-7 rounded-full bg-brandNeon text-brandBg flex items-center justify-center shadow-md transition-transform active:scale-90 flex-shrink-0 ${
                  isCurrentPlay ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-95 hover:scale-105'
                }`}
              >
                {isThisPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-brandBg" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-brandBg ml-0.5" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
