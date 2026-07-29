'use client';

import { Play, Pause, Heart, Music, ArrowLeft, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setSong, setQueue, togglePlay, toggleLikeSong } from '../../store/playerSlice';
import Link from 'next/link';

export default function FavoritesPage() {
  const dispatch = useDispatch();
  const player = useSelector((state: RootState) => state.player);
  const likedSongs = player.likedSongs;

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      dispatch(setSong(likedSongs[0]));
      dispatch(setQueue(likedSongs.slice(1)));
    }
  };

  const handlePlaySong = (song: any) => {
    dispatch(setSong(song));
    const clickedIndex = likedSongs.findIndex((s) => s.id === song.id);
    const finalIndex = clickedIndex !== -1 ? clickedIndex : 0;
    const remainingQueue = likedSongs.slice(finalIndex + 1);
    dispatch(setQueue(remainingQueue));
  };

  return (
    <div className="p-8 pb-32 space-y-8 select-none text-brandWhite animate-fade-in">
      {/* Back to Home Button */}
      <Link
        href="/"
        className="flex items-center gap-2 text-brandMuted hover:text-brandNeon transition-colors text-sm font-semibold mb-4 w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Premium Liked Songs Banner */}
      <div className="flex flex-col md:flex-row gap-8 items-end bg-gradient-to-b from-purple-900/60 to-brandBg p-8 rounded-2xl border border-purple-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-5 text-purple-500 pointer-events-none transform translate-x-12 -translate-y-12">
          <Heart className="w-64 h-64 fill-purple-500" />
        </div>
        
        {/* Heart Icon Playlist Cover */}
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-gradient-to-br from-purple-700 to-blue-500 flex items-center justify-center shadow-2xl border border-purple-500/30 z-10 flex-shrink-0">
          <Heart className="w-16 h-16 text-brandWhite fill-brandWhite" />
        </div>

        <div className="space-y-4 z-10">
          <span className="text-xs uppercase tracking-wider font-extrabold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            Auto Playlist
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">Liked Songs</h1>
          <p className="text-brandMuted text-sm max-w-md">Your personal collection of favorite tracks across all regional Telugu & Hindi albums.</p>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="text-brandWhite">KR Listener</span>
            <span className="text-brandMuted">&bull;</span>
            <span className="text-brandNeon">{likedSongs.length} Songs</span>
          </div>

          {/* Action Buttons */}
          {likedSongs.length > 0 && (
            <button
              onClick={handlePlayAll}
              className="px-6 py-3 bg-brandNeon hover:brightness-110 text-brandBg font-bold rounded-full flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              <Play className="w-5 h-5 fill-brandBg ml-0.5" />
              Play Collection
            </button>
          )}
        </div>
      </div>

      {/* Liked Songs List Table */}
      <div className="space-y-4">
        {likedSongs.length > 0 ? (
          <div className="bg-brandDarkGray/30 border border-brandHighlight rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-brandElevated text-brandMuted text-xs font-bold uppercase">
                  <th className="p-4 w-12 text-center">#</th>
                  <th className="p-4">Track</th>
                  <th className="p-4 hidden md:table-cell">Album</th>
                  <th className="p-4 w-16 text-center"></th>
                  <th className="p-4 text-right pr-6 w-24">Duration</th>
                </tr>
              </thead>
              <tbody>
                {likedSongs.map((song, index) => {
                  const isPlayingThis = player.currentSong?.id === song.id && player.isPlaying;
                  return (
                    <tr
                      key={song.id}
                      className="border-b border-brandElevated/40 hover:bg-brandElevated/40 transition-colors group cursor-pointer"
                    >
                      {/* Play / Index Cell */}
                      <td 
                        className="p-4 text-center text-brandMuted text-xs relative"
                        onClick={() => handlePlaySong(song)}
                      >
                        <span className="group-hover:hidden">{index + 1}</span>
                        <Play className="w-4 h-4 text-brandNeon hidden group-hover:block mx-auto fill-brandNeon" />
                      </td>

                      {/* Track Details Cell */}
                      <td 
                        className="p-4 flex items-center gap-3"
                        onClick={() => handlePlaySong(song)}
                      >
                        <img
                          src={song.coverImage}
                          alt={song.name}
                          className="w-10 h-10 rounded object-cover flex-shrink-0"
                        />
                        <div className="truncate">
                          <p className={`font-semibold truncate ${isPlayingThis ? 'text-brandNeon' : 'text-brandWhite'}`}>
                            {song.name}
                          </p>
                          <p className="text-xs text-brandMuted truncate">{song.artist.name}</p>
                        </div>
                      </td>

                      {/* Album Column */}
                      <td 
                        className="p-4 text-brandMuted hidden md:table-cell truncate"
                        onClick={() => handlePlaySong(song)}
                      >
                        {song.album?.name || 'Single'}
                      </td>

                      {/* Unlike Button Column */}
                      <td className="p-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(toggleLikeSong(song));
                          }}
                          className="text-brandNeon transition-transform duration-200 active:scale-125 hover:brightness-110"
                        >
                          <Heart className="w-4 h-4 fill-brandNeon" />
                        </button>
                      </td>

                      {/* Duration Column */}
                      <td 
                        className="p-4 text-right text-brandMuted pr-6 text-xs"
                        onClick={() => handlePlaySong(song)}
                      >
                        {Math.floor(song.duration / 60)}:
                        {Math.floor(song.duration % 60).toString().padStart(2, '0')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 border border-dashed border-brandElevated/60 rounded-xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
              <Heart className="w-8 h-8 fill-none" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-lg">No Liked Songs Yet</p>
              <p className="text-xs text-brandMuted max-w-xs">Tap the heart icon on any song in the player bar or homepage list to save it here.</p>
            </div>
            <Link
              href="/search"
              className="px-6 py-2 bg-brandNeon hover:brightness-110 text-brandBg font-bold rounded-full flex items-center gap-2 transition-all hover:scale-105 text-sm"
            >
              <Search className="w-4 h-4" />
              Find Songs to Like
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
