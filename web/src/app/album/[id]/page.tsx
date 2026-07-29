'use client';

import { useParams, useRouter } from 'next/navigation';
import { MOCK_ALBUMS } from '../../../lib/mockAlbums';
import { Play, Pause, Heart, Music, ArrowLeft, Disc } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { setSong, setQueue, togglePlay, toggleLikeSong } from '../../../store/playerSlice';

// Flatten MOCK_TRACKS if needed, but we can reconstruct from MOCK_ALBUMS songs

export default function AlbumPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const player = useSelector((state: RootState) => state.player);
  
  const album = MOCK_ALBUMS.find((a) => a.id === id);

  if (!album) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-brandWhite space-y-4">
        <Disc className="w-16 h-16 text-brandMuted animate-pulse" />
        <h1 className="text-2xl font-bold">Album not found</h1>
        <button 
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-brandNeon text-brandBg font-bold rounded-full hover:scale-105 transition-transform"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handlePlaySong = (song: any) => {
    if (player.currentSong?.id === song.id) {
      dispatch(togglePlay());
    } else if (album) {
      const fullSong = {
        ...song,
        coverImage: song.coverImage || album.coverImage,
        artist: typeof song.artist === 'string' ? { id: 'a5', name: song.artist } : song.artist || { id: 'a5', name: album.artist },
        album: { id: album.id, name: album.name }
      };
      dispatch(setSong(fullSong));
      
      const clickedIndex = album.songs.findIndex((s: any) => s.id === song.id);
      const finalIndex = clickedIndex !== -1 ? clickedIndex : 0;
      const otherSongs = album.songs
        .slice(finalIndex + 1)
        .map((s: any) => ({
          ...s,
          coverImage: s.coverImage || album.coverImage,
          artist: typeof s.artist === 'string' ? { id: 'a5', name: s.artist } : s.artist || { id: 'a5', name: album.artist },
          album: { id: album.id, name: album.name }
        }));
      dispatch(setQueue(otherSongs));
    }
  };

  const handlePlayAlbum = () => {
    if (album.songs.length > 0) {
      handlePlaySong(album.songs[0]);
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-32">
      {/* Hero Section */}
      <div className="relative w-full h-80 flex-shrink-0">
        <div className="absolute inset-0 overflow-hidden">
          {album.coverImage === 'collage' ? (
             <div className="w-full h-full bg-brandDarkGray filter blur-xl opacity-40 scale-110" />
          ) : (
            <img 
              src={album.coverImage} 
              alt={album.name} 
              className="w-full h-full object-cover filter blur-3xl opacity-30 scale-110" 
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brandBg via-brandBg/80 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 flex items-end gap-8">
          {album.coverImage === 'collage' ? (
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl overflow-hidden grid grid-cols-2 grid-rows-2 gap-0.5 bg-brandDarkGray shadow-2xl border border-brandHighlight/50">
              <img src="/static/images/ye_maaya_chesave.jpg" className="w-full h-full object-cover" />
              <img src="/static/images/rangasthalam.jpg" className="w-full h-full object-cover" />
              <img src="/static/images/hi_nanna.jpg" className="w-full h-full object-cover" />
              <img src="/static/images/magadheera.jpg" className="w-full h-full object-cover" />
            </div>
          ) : (
            <img 
              src={album.coverImage} 
              alt={album.name} 
              className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl object-cover shadow-2xl border border-brandHighlight/50"
            />
          )}
          
          <div className="space-y-3 pb-2">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-brandMuted hover:text-brandNeon text-sm font-bold uppercase tracking-wider transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <p className="text-xs uppercase tracking-widest font-extrabold text-brandWhite/80">Album</p>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-brandWhite tracking-tight drop-shadow-lg">{album.name}</h1>
            <div className="flex items-center gap-2 text-sm text-brandMuted font-medium">
              <img 
                src={album.coverImage === 'collage' ? "/static/images/hi_nanna.jpg" : album.coverImage} 
                className="w-6 h-6 rounded-full object-cover inline-block" 
              />
              <span className="text-brandWhite font-bold">{(album.artist as any)?.name || album.artist}</span>
              <span>&bull;</span>
              <span>{album.releaseYear}</span>
              <span>&bull;</span>
              <span>{album.songs.length} songs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-8 py-6 flex items-center gap-6 bg-brandBg">
        <button 
          onClick={handlePlayAlbum}
          className="w-14 h-14 rounded-full bg-brandNeon flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brandNeon/20"
        >
          <Play className="w-7 h-7 fill-brandBg text-brandBg ml-1" />
        </button>
        <button className="p-2 text-brandMuted hover:text-brandWhite transition-colors">
          <Heart className="w-8 h-8" />
        </button>
      </div>

      {/* Tracklist */}
      <div className="px-8 space-y-1">
        <div className="flex items-center text-xs text-brandMuted uppercase font-bold tracking-wider px-4 py-2 border-b border-brandElevated mb-4">
          <span className="w-8 text-center">#</span>
          <span className="flex-1">Title</span>
          <span className="w-16 text-right">Time</span>
        </div>

        {album.songs.map((song: any, index: number) => {
          const isCurrentPlay = player.currentSong?.id === song.id;
          const isThisPlaying = isCurrentPlay && player.isPlaying;
          
          return (
            <div 
              key={song.id}
              onClick={() => handlePlaySong(song)}
              className={`flex items-center px-4 py-3 rounded-lg cursor-pointer group transition-colors ${
                isCurrentPlay ? 'bg-brandNeon/10' : 'hover:bg-brandElevated'
              }`}
            >
              <span className="w-8 text-center text-brandMuted group-hover:hidden">
                {isThisPlaying ? (
                  <Music className="w-4 h-4 text-brandNeon animate-pulse mx-auto" />
                ) : (
                  <span className={isCurrentPlay ? 'text-brandNeon' : ''}>{index + 1}</span>
                )}
              </span>
              <span className="w-8 text-center hidden group-hover:block">
                {isThisPlaying ? (
                  <Pause className="w-4 h-4 text-brandWhite mx-auto fill-brandWhite" />
                ) : (
                  <Play className="w-4 h-4 text-brandWhite mx-auto fill-brandWhite" />
                )}
              </span>
              
              <div className="flex-1 pl-4">
                <p className={`font-semibold text-sm ${isCurrentPlay ? 'text-brandNeon' : 'text-brandWhite group-hover:text-brandWhite'}`}>
                  {song.name}
                </p>
                <p className="text-xs text-brandMuted">
                  {song.artist?.name || album.artist}
                </p>
              </div>
              
              <span className="w-16 text-right text-sm text-brandMuted">
                {Math.floor(song.duration / 60)}:{Math.floor(song.duration % 60).toString().padStart(2, '0')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
