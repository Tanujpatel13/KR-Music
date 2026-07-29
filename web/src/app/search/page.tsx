'use client';

import { Search, Play, Pause, Plus, Heart, Clock, X, Disc, Users, Music } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setSong, setQueue, togglePlay, toggleLikeSong } from '../../store/playerSlice';
import { MOCK_TRACKS } from '../../lib/mockTracks';
import { MOCK_ALBUMS } from '../../lib/mockAlbums';
import Link from 'next/link';

const GENRES_LIST = [
  { name: 'Romantic Melody', color: 'from-[#E1118C] to-[#E976A0]' },
  { name: 'Dance Pop', color: 'from-[#1E3264] to-[#3B5A9A]' },
  { name: 'Classical Fusion', color: 'from-[#509BF5] to-[#7CB7F8]' },
  { name: 'Tollywood Gold', color: 'from-[#7D4B32] to-[#B37B5E]' },
  { name: 'Bollywood Hits', color: 'from-[#E81156] to-[#F16D90]' },
  { name: 'Electronic & Lofi', color: 'from-[#608108] to-[#92BF18]' },
];

const MOODS_LIST = ['Chill', 'Party', 'Focus', 'Energetic', 'Sleep', 'Drive'];

const POPULAR_ARTISTS = [
  { id: 'a5', name: 'Devi Sri Prasad', image: '/static/images/pushpa.jpg', followers: '8.4M' },
  { id: 'a9', name: 'A. R. Rahman', image: '/static/images/ye_maaya_chesave.jpg', followers: '14.2M' },
  { id: 'a6', name: 'Hesham Abdul Wahab', image: '/static/images/hi_nanna.jpg', followers: '2.1M' },
  { id: 'a10', name: 'Thaman S', image: '/static/images/ala_vaikunthapurramuloo.jpg', followers: '5.8M' },
  { id: 'a7', name: 'M. M. Keeravani', image: '/static/images/magadheera.jpg', followers: '4.6M' },
];

export default function SearchPage() {
  const dispatch = useDispatch();
  const player = useSelector((state: RootState) => state.player);
  
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [activePlaylistSongId, setActivePlaylistSongId] = useState<string | null>(null);
  const [customPlaylists, setCustomPlaylists] = useState<any[]>([]);

  // Search Results States
  const [searchResultsSongs, setSearchResultsSongs] = useState<any[]>([]);
  const [searchResultsAlbums, setSearchResultsAlbums] = useState<any[]>([]);
  const [searchResultsArtists, setSearchResultsArtists] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const searchQuery = query || selectedGenre || selectedMood || '';
  const showSearchResults = searchQuery.length > 0;

  // Debounced search trigger effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResultsSongs([]);
      setSearchResultsAlbums([]);
      setSearchResultsArtists([]);
      setIsSearching(false);
      setHasMore(false);
      return;
    }

    setIsSearching(true);
    const delayDebounce = setTimeout(() => {
      executeSearch(searchQuery, 0, true);
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [query, selectedGenre, selectedMood]);

  const executeSearch = async (term: string, currentOffset: number, isNewSearch: boolean) => {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(term)}&offset=${currentOffset}&limit=100`);
      if (!response.ok) throw new Error('API server unreachable');
      const data = await response.json();
      
      const newSongs = data.songs || [];
      if (isNewSearch) {
        setSearchResultsSongs(newSongs);
        setSearchResultsAlbums(data.albums || []);
        setSearchResultsArtists(data.artists || []);
        setOffset(0);
      } else {
        setSearchResultsSongs(prev => [...prev, ...newSongs]);
        setOffset(currentOffset);
      }
      setHasMore(newSongs.length >= 20);
    } catch (err) {
      console.warn('Fallback to local mock search:', err);
      // Fallback local search filtering
      const termLower = term.toLowerCase();
      const localSongs = MOCK_TRACKS.filter((song) => {
        const nameMatch = song.name.toLowerCase().includes(termLower);
        const artistMatch = song.artist.name.toLowerCase().includes(termLower);
        const albumMatch = song.album.toLowerCase().includes(termLower);
        const genreMatch = selectedGenre ? song.genre === selectedGenre : true;
        return (nameMatch || artistMatch || albumMatch) && genreMatch;
      });
      if (isNewSearch) {
        setSearchResultsSongs(localSongs);
        setSearchResultsAlbums(MOCK_ALBUMS.filter(a => a.name.toLowerCase().includes(termLower)));
        setSearchResultsArtists(POPULAR_ARTISTS.filter(a => a.name.toLowerCase().includes(termLower)));
        setOffset(0);
      }
      setHasMore(false);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    // Load recent searches & playlists
    const savedRecents = localStorage.getItem('recentSearches');
    if (savedRecents) {
      setRecentSearches(JSON.parse(savedRecents));
    }
    const savedPlaylists = localStorage.getItem('customPlaylists');
    if (savedPlaylists) {
      setCustomPlaylists(JSON.parse(savedPlaylists));
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term || term.trim() === '') return;
    const cleanTerm = term.trim();
    const filtered = recentSearches.filter((item) => item.toLowerCase() !== cleanTerm.toLowerCase());
    const updated = [cleanTerm, ...filtered].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handlePlaySong = (song: any) => {
    saveRecentSearch(song.name);
    
    // Standardize object properties to match Redux state structure
    const reduxSong = {
      ...song,
      artist: typeof song.artist === 'string' ? { id: 'a5', name: song.artist } : song.artist || { id: 'a5', name: 'Unknown' },
      album: song.album ? (typeof song.album === 'string' ? { id: 'alb_' + song.id, name: song.album } : song.album) : null,
    };

    if (player.currentSong?.id === song.id) {
      dispatch(togglePlay());
    } else {
      dispatch(setSong(reduxSong));
      // Populate queue with matching songs from search results
      const clickedIndex = searchResultsSongs.findIndex(t => t.id === song.id);
      const songSource = clickedIndex !== -1 ? searchResultsSongs : MOCK_TRACKS;
      const finalIndex = clickedIndex !== -1 ? clickedIndex : songSource.findIndex(t => t.id === song.id);
      const queueList = songSource
        .slice(finalIndex + 1)
        .map((t) => ({
          ...t,
          artist: typeof t.artist === 'string' ? { id: 'a5', name: t.artist } : t.artist || { id: 'a5', name: 'Unknown' },
          album: t.album ? (typeof t.album === 'string' ? { id: 'alb_' + t.id, name: t.album } : t.album) : null,
        }));
      dispatch(setQueue(queueList));
    }
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
      audioUrl: song.audioUrl,
      artist: typeof song.artist === 'string' ? { id: 'a5', name: song.artist } : song.artist || { id: 'a5', name: 'Unknown' },
      album: song.album ? (typeof song.album === 'string' ? { id: 'alb_' + song.id, name: song.album } : song.album) : null,
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

  return (
    <div className="p-8 pb-32 space-y-10 select-none text-brandWhite animate-fade-in">
      
      {/* 1. Real-time Search Input Panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xl">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-brandMuted" />
          <input
            type="text"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (selectedGenre) setSelectedGenre(null);
              if (selectedMood) setSelectedMood(null);
            }}
            className="w-full bg-[#181818] hover:bg-[#282828] border border-white/5 focus:border-spotifyGreen focus:bg-[#282828] rounded-full py-3 pl-12 pr-12 text-sm text-brandWhite placeholder-brandMuted outline-none transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-3.5 text-brandMuted hover:text-brandWhite transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Selected Filter Indicators */}
        {(selectedGenre || selectedMood) && (
          <button
            onClick={() => {
              setSelectedGenre(null);
              setSelectedMood(null);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-spotifyGreen/10 border border-spotifyGreen/20 text-spotifyGreen hover:bg-spotifyGreen/20 transition-all text-xs font-bold rounded-full"
          >
            <span>Clear Filter ({selectedGenre || selectedMood})</span>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. BROWSE ALL MODE (No Search Input) */}
      {!showSearchResults && (
        <div className="space-y-10">
          
          {/* Recent Searches Panel */}
          {recentSearches.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-brandMuted">Recent Searches</h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs font-bold text-brandMuted hover:text-brandWhite transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {recentSearches.map((term, idx) => (
                  <div
                    key={idx}
                    onClick={() => setQuery(term)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#181818] hover:bg-[#282828] border border-white/5 rounded-full text-xs font-semibold cursor-pointer hover:border-white/10 transition-all text-brandWhite"
                  >
                    <span>{term}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-brandMuted">Trending Searches</h3>
            <div className="flex flex-wrap gap-2.5">
              {['Buttabomma', 'Srivalli', 'A. R. Rahman', 'Samayama', 'Devi Sri Prasad', 'Classical Fusion'].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 bg-[#282828]/45 hover:bg-[#282828] text-xs font-semibold border border-white/5 rounded-full hover:border-spotifyGreen/30 transition-all text-brandMuted hover:text-brandWhite"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Mood Categories Row */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-brandMuted">Filter by Mood</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {MOODS_LIST.map((mood) => (
                <button
                  key={mood}
                  onClick={() => {
                    setSelectedMood(mood);
                    setSelectedGenre(null);
                  }}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-[#181818] border border-white/5 text-brandMuted hover:text-brandWhite hover:border-white/10 hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* Genres Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Browse Genres</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
              {GENRES_LIST.map((genre) => (
                <div
                  key={genre.name}
                  onClick={() => {
                    setSelectedGenre(genre.name);
                    setSelectedMood(null);
                  }}
                  className={`bg-gradient-to-br ${genre.color} aspect-square rounded-2xl p-5 relative overflow-hidden shadow-lg cursor-pointer transform hover:scale-[1.03] active:scale-95 transition-all group`}
                >
                  <span className="font-extrabold text-base tracking-tight leading-tight block select-none break-words max-w-[80%]">
                    {genre.name}
                  </span>
                  
                  {/* Floating Vinyl Overlay */}
                  <div className="absolute -right-5 -bottom-5 w-24 h-24 bg-black/35 rounded-full flex items-center justify-center rotate-12 transform group-hover:rotate-45 transition-transform duration-700 pointer-events-none">
                    <div className="w-12 h-12 border border-white/10 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 3. SEARCH RESULTS MODE */}
      {showSearchResults && (
        <div className="space-y-8 animate-slide-up">
          {isSearching && (
            <div className="flex items-center gap-2 text-brandMuted text-xs justify-center p-2">
              <div className="w-4 h-4 border-2 border-spotifyGreen border-t-transparent rounded-full animate-spin" />
              <span>Searching open music directory...</span>
            </div>
          )}
          
          {/* Songs shelf */}
          {searchResultsSongs.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold">Songs</h2>
              <div className="bg-[#141414]/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                <div className="flex flex-col">
                  {searchResultsSongs.map((song, index) => {
                    const isPlayingThis = player.currentSong?.id === song.id && player.isPlaying;
                    const isLiked = player.likedSongs.some((s) => s.id === song.id);
                    return (
                      <div
                        key={song.id}
                        className="flex items-center justify-between p-3.5 hover:bg-[#282828]/40 border-b border-white/5 last:border-0 transition-colors group cursor-pointer"
                      >
                        {/* Left Info block */}
                        <div 
                          className="flex items-center gap-4 flex-1 truncate" 
                          onClick={() => handlePlaySong(song)}
                        >
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
                            className="w-11 h-11 rounded-lg object-cover flex-shrink-0 border border-white/5"
                          />
                          <div className="truncate">
                            <p className={`font-semibold text-sm truncate ${isPlayingThis ? 'text-spotifyGreen' : 'text-brandWhite'}`}>
                              {song.name}
                            </p>
                            <p className="text-xs text-brandMuted truncate">
                              {song.artist.name} &bull; {typeof song.album === 'object' ? song.album?.name : song.album}
                            </p>
                          </div>
                        </div>

                        {/* Right Actions */}
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
                              <Plus className="w-4 h-4" />
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
                                audioUrl: song.audioUrl,
                                artist: song.artist,
                                album: song.album ? { id: 'alb_' + song.id, name: song.album } : null,
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
                  {hasMore && (
                    <div className="flex justify-center p-4 border-t border-white/5 bg-[#181818]">
                      <button
                        onClick={() => executeSearch(searchQuery, offset + 20, false)}
                        className="px-6 py-2 bg-[#282828] hover:bg-[#323232] text-xs font-black uppercase tracking-wider rounded-full transition-all active:scale-95 text-spotifyGreen border border-spotifyGreen/20"
                      >
                        Load More Songs
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Albums shelf */}
          {searchResultsAlbums.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {searchResultsAlbums.slice(0, 5).map((album) => (
                  <Link
                    key={album.id}
                    href={`/album/${album.id}`}
                    onClick={() => {
                      saveRecentSearch(album.name);
                    }}
                    className="group premium-card p-4 flex flex-col gap-3 relative cursor-pointer hover:border-spotifyGreen/20 transition-all shadow-xl"
                  >
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-md">
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
                        <button className="w-11 h-11 rounded-full bg-spotifyGreen text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                          <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm truncate text-brandWhite">{album.name}</h3>
                      <p className="text-xs text-brandMuted truncate">{(album.artist as any)?.name || album.artist}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Artists shelf */}
          {searchResultsArtists.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold">Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {searchResultsArtists.map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/artist/${artist.id}`}
                    onClick={() => {
                      saveRecentSearch(artist.name);
                    }}
                    className="group bg-[#181818] border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center gap-3 relative cursor-pointer hover:bg-[#282828]/50 transition-all shadow-xl"
                  >
                    <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-md">
                      <img
                        src={artist.image}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm truncate text-brandWhite">{artist.name}</h3>
                      <p className="text-xs text-brandMuted">{artist.followers} followers</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty search results fallback */}
          {searchResultsSongs.length === 0 && searchResultsAlbums.length === 0 && searchResultsArtists.length === 0 && (
            <div className="flex flex-col items-center justify-center p-20 border border-dashed border-white/5 rounded-2xl space-y-4">
              <Music className="w-12 h-12 text-brandMuted animate-pulse" />
              <div className="text-center space-y-1">
                <p className="font-semibold text-base">No results found for "{searchQuery}"</p>
                <p className="text-xs text-brandMuted">Please verify your search query syntax or modify filters.</p>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
