'use client';

import { useParams, useRouter } from 'next/navigation';
import { Play, Pause, Heart, User, Check, ArrowLeft, Disc, Music, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { setSong, setQueue, togglePlay, toggleLikeSong } from '../../../store/playerSlice';
import { useState, useEffect } from 'react';
import { MOCK_TRACKS } from '../../../lib/mockTracks';
import { MOCK_ALBUMS } from '../../../lib/mockAlbums';
import Link from 'next/link';

const ARTIST_DB: Record<string, { name: string; bio: string; image: string; listeners: string; verified: boolean }> = {
  'a5': {
    name: 'Devi Sri Prasad',
    bio: 'Devi Sri Prasad (DSP) is an Indian music composer, lyricist, and singer. He is one of the most prominent composers in Tollywood history, known for high-octane blockbusters like Pushpa, Rangasthalam, and Arya.',
    image: '/static/images/pushpa.jpg',
    listeners: '12,456,802',
    verified: true
  },
  'a9': {
    name: 'A. R. Rahman',
    bio: 'Allah Rakha Rahman is a world-renowned Indian music composer, producer, singer, and songwriter. Popularly called the "Mozart of Madras", he has won two Academy Awards, two Grammy Awards, a BAFTA, and a Golden Globe.',
    image: '/static/images/ye_maaya_chesave.jpg',
    listeners: '24,890,123',
    verified: true
  },
  'a6': {
    name: 'Hesham Abdul Wahab',
    bio: 'Hesham Abdul Wahab is a talented Indian music director, singer, and audio engineer. He gained massive critical and commercial acclaim in Tollywood for composing soulful soundtracks like Hridayam and Hi Nanna.',
    image: '/static/images/hi_nanna.jpg',
    listeners: '4,210,456',
    verified: true
  },
  'a10': {
    name: 'Thaman S',
    bio: 'Ghantasala Sai Srinivas Thaman is a leading Indian music composer and singer. Known for his sensational background scores and chartbuster songs, he dominated the Tollywood charts with records like Ala Vaikunthapurramuloo.',
    image: '/static/images/ala_vaikunthapurramuloo.jpg',
    listeners: '10,678,219',
    verified: true
  },
  'a7': {
    name: 'M. M. Keeravani',
    bio: 'M. M. Keeravani is a legendary Academy Award-winning composer. He composed the historic scores for Baahubali and RRR, winning the Oscar for Best Original Song in 2023.',
    image: '/static/images/magadheera.jpg',
    listeners: '9,842,504',
    verified: true
  },
  'a3': {
    name: 'Anurag Kulkarni',
    bio: 'Anurag Kulkarni is a leading Indian playback singer working primarily in Tollywood. Known for his versatile vocals and emotional depth, he has sung major chartbusters in Shyam Singha Roy and Mahanati.',
    image: '/static/images/sirivennela.jpg',
    listeners: '5,120,670',
    verified: true
  },
  'a8': {
    name: 'Gopi Sundar',
    bio: 'Gopi Sundar is a highly popular composer and singer working across Telugu, Malayalam, and Tamil cinema. He composed blockbuster soundtracks like Geetha Govindam and Majili.',
    image: '/static/images/geetha_govindham.jpg',
    listeners: '6,450,290',
    verified: true
  }
};

export default function ArtistPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const player = useSelector((state: RootState) => state.player);

  const [isFollowing, setIsFollowing] = useState(false);
  const [customPlaylists, setCustomPlaylists] = useState<any[]>([]);
  const [activePlaylistSongId, setActivePlaylistSongId] = useState<string | null>(null);

  useEffect(() => {
    // Load playlists & following state
    const savedPlaylists = localStorage.getItem('customPlaylists');
    if (savedPlaylists) {
      setCustomPlaylists(JSON.parse(savedPlaylists));
    }
    const followed = localStorage.getItem(`followed_artist_${id}`);
    if (followed) {
      setIsFollowing(true);
    }
  }, [id]);

  const artistId = id as string;
  const artistInfo = ARTIST_DB[artistId] || {
    name: 'Unknown Artist',
    bio: 'No biography available for this artist at this time.',
    image: '/static/images/popular_hits.jpg',
    listeners: '1,200,450',
    verified: false
  };

  const handleFollowToggle = () => {
    const nextVal = !isFollowing;
    setIsFollowing(nextVal);
    if (nextVal) {
      localStorage.setItem(`followed_artist_${id}`, 'true');
    } else {
      localStorage.removeItem(`followed_artist_${id}`);
    }
  };

  // Filter songs & albums by this artist
  const artistSongs = MOCK_TRACKS.filter((song) => song.artist.id === artistId);
  const artistAlbums = MOCK_ALBUMS.filter((album) => album.songs.some(s => {
    const trackDetail = MOCK_TRACKS.find(t => t.id === s.id);
    return trackDetail?.artist.id === artistId;
  }) || album.artist === artistInfo.name);

  const handlePlaySong = (song: any) => {
    const reduxSong = {
      ...song,
      artist: { id: artistId, name: artistInfo.name },
      album: song.album ? { id: 'alb_' + song.id, name: song.album } : null,
    };

    if (player.currentSong?.id === song.id) {
      dispatch(togglePlay());
    } else {
      dispatch(setSong(reduxSong));
      const clickedIndex = artistSongs.findIndex((s) => s.id === song.id);
      const finalIndex = clickedIndex !== -1 ? clickedIndex : 0;
      const otherSongs = artistSongs
        .slice(finalIndex + 1)
        .map((s) => ({
          ...s,
          artist: { id: artistId, name: artistInfo.name },
          album: s.album ? { id: 'alb_' + s.id, name: s.album } : null,
        }));
      dispatch(setQueue(otherSongs));
    }
  };

  const handlePlayArtistPopular = () => {
    if (artistSongs.length > 0) {
      handlePlaySong(artistSongs[0]);
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
      artist: { id: artistId, name: artistInfo.name },
      album: song.album ? { id: 'alb_' + song.id, name: song.album } : null,
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
    <div className="flex flex-col min-h-full pb-32 text-brandWhite">
      {/* 1. Artist Hero Header */}
      <div className="relative w-full h-[40vh] sm:h-[45vh] flex-shrink-0 overflow-hidden">
        <img
          src={artistInfo.image}
          alt={artistInfo.name}
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.5] scale-102"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/30" />

        <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col gap-3 justify-end h-full">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-brandMuted hover:text-[#FFFFFF] text-xs font-extrabold uppercase tracking-widest transition-colors mb-4 w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
            {artistInfo.verified && (
              <span className="p-0.5 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </span>
            )}
            <span className="text-white">Verified Artist</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white drop-shadow-lg">
            {artistInfo.name}
          </h1>

          <p className="text-sm font-semibold text-brandMuted">
            {artistInfo.listeners} monthly listeners
          </p>
        </div>
      </div>

      {/* 2. Action Controls Bar */}
      <div className="px-8 py-6 flex items-center gap-6 bg-[#121212] z-10">
        {artistSongs.length > 0 && (
          <button
            onClick={handlePlayArtistPopular}
            className="w-14 h-14 rounded-full bg-spotifyGreen flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-spotifyGreen/10"
          >
            <Play className="w-7 h-7 fill-black text-black ml-1" />
          </button>
        )}
        <button
          onClick={handleFollowToggle}
          className={`px-6 py-2 rounded-full border text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${isFollowing
              ? 'bg-transparent border-white text-white'
              : 'bg-spotifyGreen border-spotifyGreen text-black hover:bg-spotifyGreen/90 font-extrabold'
            }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* 3. Popular Songs List */}
      <div className="px-8 space-y-6 bg-[#121212] z-10">
        <h2 className="text-xl font-bold tracking-tight">Popular Tracks</h2>
        <div className="bg-[#181818] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="flex flex-col">
            {artistSongs.slice(0, 5).map((song, index) => {
              const isPlayingThis = player.currentSong?.id === song.id && player.isPlaying;
              const isLiked = player.likedSongs.some((s) => s.id === song.id);
              return (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-3.5 hover:bg-[#282828]/50 border-b border-white/5 last:border-0 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1 truncate" onClick={() => handlePlaySong(song)}>
                    <span className="w-6 text-center text-xs text-brandMuted relative flex items-center justify-center">
                      <span className="group-hover:hidden">{index + 1}</span>
                      <Play className="w-3.5 h-3.5 text-spotifyGreen hidden group-hover:block fill-spotifyGreen" />
                    </span>
                    <img
                      src={song.coverImage}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-white/5"
                    />
                    <div className="truncate">
                      <p className={`font-semibold text-sm truncate ${isPlayingThis ? 'text-spotifyGreen' : 'text-brandWhite'}`}>
                        {song.name}
                      </p>
                      <p className="text-xs text-brandMuted truncate mt-0.5">{typeof song.album === 'object' && song.album !== null ? song.album.name : song.album || ''}</p>
                    </div>
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
                          artist: { id: artistId, name: artistInfo.name },
                          album: song.album ? { id: 'alb_' + song.id, name: song.album } : null,
                        };
                        dispatch(toggleLikeSong(reduxSong));
                      }}
                      className={`transition-transform duration-200 active:scale-125 ${isLiked ? 'text-spotifyGreen' : 'text-brandMuted hover:text-brandWhite'
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
      </div>

      {/* 4. Albums Grid */}
      {artistAlbums.length > 0 && (
        <div className="px-8 pt-10 space-y-4 bg-[#121212] z-10">
          <h2 className="text-xl font-bold tracking-tight">Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {artistAlbums.map((album) => (
              <Link
                key={album.id}
                href={`/album/${album.id}`}
                className="group premium-card p-4 flex flex-col gap-3 relative cursor-pointer hover:border-spotifyGreen/20 transition-all shadow-xl"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-md">
                  <img
                    src={album.coverImage}
                    alt={album.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <button className="w-10 h-10 rounded-full bg-spotifyGreen text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                      <Play className="w-4.5 h-4.5 fill-black text-black ml-0.5" />
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-sm truncate text-brandWhite">{album.name}</h3>
                  <p className="text-xs text-brandMuted">{album.releaseYear}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 5. Artist Biography section */}
      <div className="px-8 pt-10 space-y-4 bg-[#121212] z-10">
        <h2 className="text-xl font-bold tracking-tight">About {artistInfo.name}</h2>
        <div className="bg-[#181818] border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
          <div className="relative w-36 h-36 rounded-full overflow-hidden flex-shrink-0 shadow-md">
            <img
              src={artistInfo.image}
              alt=""
              className="w-full h-full object-cover scale-102"
            />
          </div>
          <div className="space-y-3 flex-1">
            <p className="text-sm text-brandMuted leading-relaxed">
              {artistInfo.bio}
            </p>
            <div className="flex items-center gap-4 text-xs font-bold text-spotifyGreen uppercase">
              <span>{artistInfo.listeners} monthly listeners</span>
              <span>&bull;</span>
              <span>Verified profile</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
