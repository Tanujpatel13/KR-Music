'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Play, Pause, Trash2, Music, ArrowLeft, Disc, Plus, Star, Search, Share2, Download, Check } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { setSong, setQueue, togglePlay } from '../../../store/playerSlice';
import Link from 'next/link';
import { MOCK_TRACKS } from '../../../lib/mockTracks';

export default function PlaylistDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const player = useSelector((state: RootState) => state.player);
  
  const [playlist, setPlaylist] = useState<any | null>(null);
  const [recSearch, setRecSearch] = useState('');
  const [isDownloaded, setIsDownloaded] = useState(false);

  const playlistId = params.id as string;

  const loadPlaylist = async () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('customPlaylists');
      if (saved) {
        const playlists = JSON.parse(saved);
        const found = playlists.find((pl: any) => String(pl.id) === String(playlistId));
        if (found && found.songs && found.songs.length > 0) {
          setPlaylist(found);
          // If it only has previewSongs (4 songs), still load full list from backend
          if (!found.songCount || found.songs.length >= 10) return;
        }
      }

      // Load full song list from backend (paginated, fast)
      try {
        const res = await fetch(`/api/playlists/${playlistId}/songs?limit=200`);
        if (res.ok) {
          const data = await res.json();
          const formatted = {
            id: data.id,
            name: data.name,
            description: data.description,
            coverImage: data.coverImage || data.songs?.[0]?.coverImage,
            songCount: data.songCount,
            songs: data.songs
          };
          setPlaylist(formatted);
        }
      } catch (err) {
        console.warn('Failed to fetch playlist from backend:', err);
      }
    }
  };

  useEffect(() => {
    loadPlaylist();
    window.addEventListener('playlists-updated', loadPlaylist);
    return () => window.removeEventListener('playlists-updated', loadPlaylist);
  }, [playlistId]);


  if (!playlist) {
    return (
      <div className="p-8 text-brandWhite select-none flex flex-col items-center justify-center h-full space-y-4">
        <Disc className="w-12 h-12 text-brandMuted animate-spin-slow" />
        <p className="text-sm text-brandMuted">Loading playlist details...</p>
        <Link href="/" className="text-xs text-spotifyGreen hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  const handlePlayAll = () => {
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

  const handlePlaySong = (song: any) => {
    const formattedSong = {
      ...song,
      artist: typeof song.artist === 'string' ? { id: 'a5', name: song.artist } : song.artist || { id: 'a5', name: 'Unknown' },
      album: song.album || { id: playlist.id, name: playlist.name }
    };
    dispatch(setSong(formattedSong));

    const clickedIndex = playlist.songs.findIndex((s: any) => s.id === song.id);
    const finalIndex = clickedIndex !== -1 ? clickedIndex : 0;
    const remainingQueue = playlist.songs
      .slice(finalIndex + 1)
      .map((s: any) => ({
        ...s,
        artist: typeof s.artist === 'string' ? { id: 'a5', name: s.artist } : s.artist || { id: 'a5', name: 'Unknown' },
        album: s.album || { id: playlist.id, name: playlist.name }
      }));
    dispatch(setQueue(remainingQueue));
  };

  const handleRemoveSong = (e: React.MouseEvent, songId: string) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('customPlaylists');
      if (saved) {
        const playlists = JSON.parse(saved);
        const updatedPlaylists = playlists.map((pl: any) => {
          if (String(pl.id) === String(playlistId)) {
            return {
              ...pl,
              songs: pl.songs.filter((s: any) => s.id !== songId),
            };
          }
          return pl;
        });
        localStorage.setItem('customPlaylists', JSON.stringify(updatedPlaylists));
        window.dispatchEvent(new Event('playlists-updated'));
      }
    }
  };

  const handleDeletePlaylist = () => {
    if (confirm(`Are you sure you want to delete the playlist "${playlist.name}"?`)) {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('customPlaylists');
        if (saved) {
          const playlists = JSON.parse(saved);
          const updatedPlaylists = playlists.filter((pl: any) => String(pl.id) !== String(playlistId));
          localStorage.setItem('customPlaylists', JSON.stringify(updatedPlaylists));
          window.dispatchEvent(new Event('playlists-updated'));
          router.push('/');
        }
      }
    }
  };

  const handleAddSong = (song: any) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('customPlaylists');
      if (saved) {
        const playlists = JSON.parse(saved);
        const updatedPlaylists = playlists.map((pl: any) => {
          if (String(pl.id) === String(playlistId)) {
            const exists = pl.songs.some((s: any) => s.id === song.id);
            if (!exists) {
              return {
                ...pl,
                songs: [...pl.songs, {
                  id: song.id,
                  name: song.name,
                  duration: song.duration,
                  coverImage: song.coverImage,
                  audioUrl: song.audioUrl,
                  artist: song.artist,
                  album: song.album
                }],
              };
            }
          }
          return pl;
        });
        localStorage.setItem('customPlaylists', JSON.stringify(updatedPlaylists));
        window.dispatchEvent(new Event('playlists-updated'));
      }
    }
  };

  const handleSharePlaylist = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Playlist link copied to clipboard!');
  };

  // Recommendations logic: recommend songs matching the genre of playlist songs, or fallback to overall list
  const existingSongsIds = new Set((playlist.songs || []).map((s: any) => s.id));
  
  let recPool = MOCK_TRACKS;
  if (playlist.songs && playlist.songs.length > 0) {
    const genres = playlist.songs.map((s: any) => s.genre);
    recPool = MOCK_TRACKS.filter(t => genres.includes(t.genre));
    if (recPool.length < 5) {
      recPool = MOCK_TRACKS;
    }
  }

  // Filter recommendations matching the search widget inside the playlist page
  const filteredRecs = recPool
    .filter(t => !existingSongsIds.has(t.id))
    .filter(t => {
      if (!recSearch) return true;
      const term = recSearch.toLowerCase();
      return t.name.toLowerCase().includes(term) || t.artist.name.toLowerCase().includes(term);
    })
    .slice(0, 5);

  const playlistCover = playlist.songs && playlist.songs.length > 0
    ? playlist.songs[0].coverImage
    : null;

  return (
    <div className="p-8 pb-32 space-y-8 select-none text-brandWhite animate-fade-in">
      
      {/* Navigation and Delete Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-brandMuted hover:text-[#FFFFFF] text-sm font-semibold w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <button
          onClick={handleDeletePlaylist}
          className="text-xs font-semibold text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-full border border-red-500/20 transition-all active:scale-95"
        >
          Delete Playlist
        </button>
      </div>

      {/* Apple Glassmorphism Playlist Hero Banner */}
      <div className="flex flex-col md:flex-row gap-8 items-end bg-white/10 backdrop-blur-3xl saturate-200 p-8 rounded-3xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 text-emerald-400 pointer-events-none transform translate-x-12 -translate-y-12">
          <Music className="w-64 h-64" />
        </div>


        {/* Playlist Cover Art */}
        {playlistCover ? (
          <img
            src={playlistCover}
            alt={playlist.name}
            className="w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover shadow-2xl border border-white/5 flex-shrink-0 z-10"
          />
        ) : (
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-[#282828] flex items-center justify-center shadow-2xl border border-white/5 flex-shrink-0 z-10">
            <Music className="w-14 h-14 text-brandMuted" />
          </div>
        )}

        <div className="space-y-4 z-10 flex-grow">
          <span className="text-xs uppercase tracking-wider font-extrabold text-spotifyGreen bg-spotifyGreen/10 px-3 py-1 rounded-full border border-spotifyGreen/20">
            Custom Playlist
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">{playlist.name}</h1>
          <p className="text-brandMuted text-sm max-w-md">
            {playlist.description || 'A playlist curated by KR Listener.'}
          </p>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="text-brandWhite">KR Listener</span>
            <span className="text-brandMuted">&bull;</span>
            <span className="text-spotifyGreen">{playlist.songs?.length || 0} Songs</span>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-4 pt-2">
            {playlist.songs && playlist.songs.length > 0 && (
              <button
                onClick={handlePlayAll}
                className="px-6 py-3 bg-spotifyGreen hover:bg-spotifyGreen/90 text-black font-extrabold rounded-full flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                Play Playlist
              </button>
            )}
            
            <button
              onClick={handleSharePlaylist}
              className="p-2.5 rounded-full bg-[#282828] hover:bg-[#323232] border border-white/5 transition-all text-brandWhite active:scale-95"
              title="Share Playlist"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsDownloaded(!isDownloaded)}
              className={`p-2.5 rounded-full border transition-all active:scale-95 ${
                isDownloaded ? 'bg-spotifyGreen/10 border-spotifyGreen text-spotifyGreen' : 'bg-[#282828] hover:bg-[#323232] border-white/5 text-brandWhite'
              }`}
              title={isDownloaded ? 'Downloaded offline' : 'Download playlist'}
            >
              {isDownloaded ? <Check className="w-5 h-5" /> : <Download className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Playlist Tracks Table */}
      <div className="space-y-4">
        {playlist.songs && playlist.songs.length > 0 ? (
          <div className="bg-[#181818] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/5 text-brandMuted text-xs font-bold uppercase">
                  <th className="p-4 w-12 text-center">#</th>
                  <th className="p-4">Track</th>
                  <th className="p-4 hidden md:table-cell">Album</th>
                  <th className="p-4 w-12 text-center"></th>
                  <th className="p-4 text-right pr-6 w-24">Duration</th>
                </tr>
              </thead>
              <tbody>
                {playlist.songs.map((song: any, index: number) => {
                  const isPlayingThis = player.currentSong?.id === song.id && player.isPlaying;
                  return (
                    <tr
                      key={song.id}
                      className="border-b border-white/5 hover:bg-[#282828]/40 transition-colors group cursor-pointer"
                    >
                      {/* Play / Index Cell */}
                      <td
                        className="p-4 text-center text-brandMuted text-xs relative"
                        onClick={() => handlePlaySong(song)}
                      >
                        <span className="group-hover:hidden">{index + 1}</span>
                        <Play className="w-4 h-4 text-spotifyGreen hidden group-hover:block mx-auto fill-spotifyGreen" />
                      </td>

                      {/* Track Details Cell */}
                      <td
                        className="p-4 flex items-center gap-3"
                        onClick={() => handlePlaySong(song)}
                      >
                        <img
                          src={song.coverImage}
                          alt=""
                          className="w-10 h-10 rounded object-cover flex-shrink-0"
                        />
                        <div className="truncate">
                          <p className={`font-semibold truncate ${isPlayingThis ? 'text-spotifyGreen' : 'text-brandWhite'}`}>
                            {song.name}
                          </p>
                          <p className="text-xs text-brandMuted truncate">
                            {song.artist?.name || song.artist || 'Unknown'}
                          </p>
                        </div>
                      </td>

                      {/* Album Column */}
                      <td
                        className="p-4 text-brandMuted hidden md:table-cell truncate"
                        onClick={() => handlePlaySong(song)}
                      >
                        {typeof song.album === 'string' ? song.album : (song.album as any)?.name || 'Single'}
                      </td>

                      {/* Delete Track Button */}
                      <td className="p-4 text-center">
                        <button
                          onClick={(e) => handleRemoveSong(e, song.id)}
                          className="text-brandMuted hover:text-red-500 transition-colors p-1.5 rounded hover:bg-red-500/10"
                          title="Remove Song from Playlist"
                        >
                          <Trash2 className="w-4 h-4" />
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
          <div className="flex flex-col items-center justify-center p-16 border border-dashed border-white/5 rounded-2xl space-y-4 bg-[#181818]/30">
            <div className="w-16 h-16 rounded-full bg-spotifyGreen/10 flex items-center justify-center border border-spotifyGreen/20 text-spotifyGreen">
              <Music className="w-8 h-8" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-lg">Your Playlist is Empty</p>
              <p className="text-xs text-brandMuted max-w-xs">
                Browse our search page, or use the interactive finder below to add tracks to your playlist.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. Interactive Recommendation Finder */}
      <section className="space-y-4 pt-8 border-t border-white/5">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <Star className="w-5 h-5 text-spotifyGreen" />
            Let's add some songs to "{playlist.name}"
          </h2>
          
          {/* Quick Filter Search Input */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-brandMuted" />
            <input
              type="text"
              placeholder="Search songs to add..."
              value={recSearch}
              onChange={(e) => setRecSearch(e.target.value)}
              className="w-full bg-[#181818] border border-white/5 focus:border-spotifyGreen rounded-full py-2 pl-9 pr-4 text-xs text-brandWhite placeholder-brandMuted outline-none"
            />
          </div>
        </div>

        {/* Suggested list */}
        {filteredRecs.length > 0 ? (
          <div className="bg-[#181818] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="flex flex-col">
              {filteredRecs.map((song, index) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-3 hover:bg-[#282828]/40 border-b border-white/5 last:border-0 transition-colors group cursor-pointer animate-fade-in"
                >
                  <div className="flex items-center gap-4 flex-1 truncate" onClick={() => handlePlaySong(song)}>
                    <span className="w-6 text-center text-xs text-brandMuted relative flex items-center justify-center">
                      <span className="group-hover:hidden">{index + 1}</span>
                      <Play className="w-3.5 h-3.5 text-spotifyGreen hidden group-hover:block fill-spotifyGreen" />
                    </span>
                    <img
                      src={song.coverImage}
                      alt=""
                      className="w-11 h-11 rounded-lg object-cover flex-shrink-0 border border-white/5 shadow-sm"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-sm truncate text-brandWhite group-hover:text-spotifyGreen transition-colors">
                        {song.name}
                      </p>
                      <p className="text-xs text-brandMuted truncate">{typeof song.artist === 'object' ? song.artist?.name : song.artist} &bull; {typeof song.album === 'string' ? song.album : (song.album as any)?.name || ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <button
                      onClick={() => handleAddSong(song)}
                      className="flex items-center gap-1 px-4 py-1.5 bg-[#282828] hover:bg-spotifyGreen text-white hover:text-black border border-white/5 hover:border-spotifyGreen rounded-full text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                    <span className="text-xs text-brandMuted pr-3 w-10 text-right">
                      {Math.floor(song.duration / 60)}:
                      {Math.floor(song.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center p-8 border border-dashed border-white/5 rounded-2xl text-brandMuted italic text-xs">
            No suggestions found. Try clearing the search query to show recommendations.
          </div>
        )}
      </section>

    </div>
  );
}
