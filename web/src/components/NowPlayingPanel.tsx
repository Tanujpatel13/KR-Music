'use client';

import { X, Heart, Sparkles, Disc, Music, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setNowPlayingOpen, toggleLikeSong } from '../store/playerSlice';
import { MOCK_ALBUMS } from '../lib/mockAlbums';
import { useRouter } from 'next/navigation';

const ARTIST_DETAILS: Record<string, { bio: string; image: string; popularity: number }> = {
  'a1': {
    bio: 'Leading Hindi playback singer and composer known for romantic melodies.',
    image: '/static/images/kesariya.jpg',
    popularity: 98
  },
  'a2': {
    bio: 'Renowned Indian-American Carnatic musician and playback singer in Telugu cinema.',
    image: '/static/images/srivalli.jpg',
    popularity: 95
  },
  'a3': {
    bio: 'Renowned Telugu playback singer known for emotional range and chartbusters.',
    image: '/static/images/sirivennela.jpg',
    popularity: 90
  },
  'a4': {
    bio: 'Acclaimed Indian music composer and singer known for his work in Telugu cinema.',
    image: '/static/images/shyam_singha_roy.jpg',
    popularity: 92
  },
  'a5': {
    bio: 'Famous music composer, singer, and director in South Indian cinema, particularly Telugu.',
    image: '/static/images/pushpa.jpg',
    popularity: 96
  },
  'a6': {
    bio: 'Famous music composer and singer known for his soulful melodies in Malayalam and Telugu cinema.',
    image: '/static/images/hi_nanna.jpg',
    popularity: 94
  },
  'a7': {
    bio: 'Legendary Indian music composer and playback singer who won the Academy Award for Naatu Naatu.',
    image: '/static/images/magadheera.jpg',
    popularity: 97
  },
  'a8': {
    bio: 'Popular Indian music composer, singer, and programmer known for Malayalam and Telugu cinema hits.',
    image: '/static/images/geetha_govindham.jpg',
    popularity: 93
  },
  'a9': {
    bio: 'Academy Award winning composer, singer, and songwriter.',
    image: '/static/images/ye_maaya_chesave.jpg',
    popularity: 99
  },
  'a10': {
    bio: 'Prominent Telugu music director and composer.',
    image: '/static/images/ala_vaikunthapurramuloo.jpg',
    popularity: 95
  },
  'a11': {
    bio: 'Acclaimed composer and music producer in South India.',
    image: '/static/images/orange.jpg',
    popularity: 94
  },
  'a12': {
    bio: 'Highly versatile Indian music composer and singer.',
    image: '/static/images/v.jpg',
    popularity: 94
  },
  'a13': {
    bio: 'Award-winning Indian music composer, singer, and actor.',
    image: '/static/images/darling.jpg',
    popularity: 94
  },
  'a14': {
    bio: 'Legendary Indian music composer, singer, and music director active primarily in Telugu cinema, known as Melodi Brahma.',
    image: '/static/images/arjun.jpg',
    popularity: 95
  }
};

const MOCK_LYRICS: Record<string, string> = {
  'ssr1': 'Pranavalaya chathura harini\nNarthana murali dhari\nSakala kalaa ranjini\n\nNee roopame chithram\nNee chupu Pranavam\nEe jagame nee narthana nivasam',
  'ssr2': 'Ee kshaname eduruga nilichina siri\nVennela kurisenamma\nGundela lopala nee gnaapakam\nDeepam veliginchedamma\n\nSirivennela tarallo neeve chirunavvule chiliki\nPrathi sandhya ragame nee gunde thadi niki',
  's3': 'Choope bangaramayene srivalli\nMaate maanikyamayene\nNavve navvaabunayene srivalli\nChoosthe sravanamayene\n\nKallu peddhavi chesi choodu srivalli\nKaalu jaddi thiruguthunna saami',
  'hn1': 'Samayama reppalu veyakuma\nHrudayama sadiye cheyakuma\nChelini nenu choosey vela\nKaalam aagipoda ila\n\nSamayama o samayama nee thodu nilichi\nEe kshanalani dachi cheli ki andhincha kuthuraa',
  'mag1': 'Panchadara bomma bomma\nNinnu choosthe pranam pothundhe bomma\n\nNee navvula thootale vesina kshanaana\nNee thodu aynaane o chinnadhaana',
  'gg1': 'Inkem Inkem Inkem Kaavaale\nChaale idhi chaale naku\nNee choope chalu naku\nNee thodu chalu naku\n\nGundelona cheri naavu o priyurala\nOopiri aagipoyedhaaka ninnu maruvaney',
  'ymc1': 'Aaromale Aaromale...\nManasuna unna mounam karigipoye vela\nNee swaasa lo nenu swaasinchanaa\n\nAaromale o my darling sweet girl\nNee sneham korikaga nilichene',
  'ymc2': 'Ee Hridayam Ninnu Choodaka Aagena\nNee thalape prathi kshanamu veeduna\n\nNee hridayamlo naku chotulera nesthem\nNee chelimi vethike payanam naadhe',
  'ran1': 'Rangamma Mangamma em pilladho pilla\nGundello mantese pilladho\n\nNuvvu matlaadithey mathi pothundhi\nNuvvu choosthe manasu karigipothundhi',
  'ary1': 'Feel My Love Feel My Love\nNenu ninnu choodakunna feel my love\nNuvvu nannu thalakunna feel my love\n\nPrema lo muniginattu layalo aagipoku\nPrathi kshanamu nee dhyaname feel my love',
  'av1': 'Buttabomma Buttabomma\nNinnu chusthe padipoya\nNee butta bomma laaga nannu dachipove\n\nRamuloo Ramula ee dance floor lo\nNeetho jathaga nenu aadaalamma',
  'ora1': 'Ola Olaala Ala Oorinchina Prema\nNee kanti paapa naalo cheri na kshanaana\n\nRooba rooba rooba roobaa\nNee chelimilo na manasu nilichene',
  'mir3': 'Darlingey Darlingey darlingey\nNee kanti chupullona padipoyaney\n\nIdhedho Bagundhe chinnadhaana\nNee vethike payaname premaga maarene'
};

export default function NowPlayingPanel() {
  const dispatch = useDispatch();
  const router = useRouter();
  const player = useSelector((state: RootState) => state.player);
  const { currentSong, isNowPlayingOpen, likedSongs, queue } = player;

  if (!currentSong) return null;

  const isLiked = likedSongs.some((s) => s.id === currentSong.id);
  const artistId = currentSong.artist.id || 'a5';
  const artistInfo = ARTIST_DETAILS[artistId] || {
    bio: 'Acclaimed Tollywood composer and musical genius.',
    image: currentSong.coverImage,
    popularity: 92
  };

  const songLyrics = MOCK_LYRICS[currentSong.id] || 
    `Lyrics for "${currentSong.name}" by ${currentSong.artist.name}\n\n[Music Intro]\n\nGundelona cheri naavu o nesthem\nNee thodu chalu naku prathi kshanamu\nNee navvula thootale vesina kshanaana\nKaalam aagipoda ila...`;

  const nextSong = queue && queue.length > 0 ? queue[0] : null;

  const handleCoverClick = () => {
    if (currentSong.album?.name) {
      const foundAlbum = MOCK_ALBUMS.find(a => a.name === currentSong.album?.name);
      if (foundAlbum) {
        dispatch(setNowPlayingOpen(false)); // Optional: close panel to show main view better
        router.push(`/album/${foundAlbum.id}`);
      } else {
        alert(`Album details for "${currentSong.album.name}" are not available.`);
      }
    }
  };

  return (
    <div
      className={`fixed top-0 bottom-24 right-0 w-full sm:w-96 bg-brandBg border-l border-brandElevated z-40 flex flex-col transition-transform duration-300 ease-in-out transform-gpu shadow-2xl ${
        isNowPlayingOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ willChange: 'transform' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-brandElevated flex-shrink-0">
        <div className="flex items-center gap-2 text-brandMuted text-xs uppercase tracking-wider font-bold">
          <Disc className="w-4 h-4 text-brandNeon animate-spin-slow" />
          <span>Now Playing View</span>
        </div>
        <button
          onClick={() => dispatch(setNowPlayingOpen(false))}
          className="p-1.5 rounded-full text-brandMuted hover:text-brandWhite hover:bg-brandElevated transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
        {/* 1. Large Cover Art & Info */}
        <div className="space-y-4">
          <div 
            className="relative aspect-square w-full rounded-xl overflow-hidden shadow-2xl border border-brandHighlight bg-brandDarkGray group cursor-pointer"
            onClick={handleCoverClick}
            title="View Album"
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
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
            )}
            <div className="absolute top-3 right-3 bg-brandBg/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-brandHighlight flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-brandNeon" />
              <span className="text-[10px] font-bold text-brandWhite uppercase tracking-wide">Lossless 24-bit</span>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="truncate">
              <h2 className="text-xl font-bold text-brandWhite truncate leading-tight hover:underline cursor-pointer">
                {currentSong.name}
              </h2>
              <p className="text-sm text-brandMuted hover:underline cursor-pointer truncate mt-0.5">
                {currentSong.artist.name}
              </p>
            </div>
            <button
              onClick={() => dispatch(toggleLikeSong(currentSong))}
              className={`p-2 rounded-full hover:bg-brandHighlight transition-transform duration-200 active:scale-125 ${
                isLiked ? 'text-brandNeon' : 'text-brandMuted hover:text-brandWhite'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-brandNeon text-brandNeon' : ''}`} />
            </button>
          </div>
        </div>

        {/* 2. Synced Lyrics Box */}
        <div className="bg-brandDarkGray border border-brandElevated p-4 rounded-xl space-y-3 shadow-inner">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-brandNeon flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5" />
            Lyrics Snippet
          </p>
          <div className="text-xs text-brandWhite/90 whitespace-pre-wrap leading-relaxed select-text font-medium italic max-h-36 overflow-y-auto scrollbar-none">
            {songLyrics}
          </div>
        </div>

        {/* 3. About the Artist */}
        <div className="bg-brandDarkGray border border-brandElevated rounded-xl overflow-hidden shadow-lg">
          <div className="h-28 relative overflow-hidden bg-brandDarkGray">
            <img
              src={artistInfo.image}
              alt={currentSong.artist.name}
              className="w-full h-full object-cover filter brightness-[0.4] scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brandDarkGray/95 to-transparent" />
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brandNeon" />
              <span className="text-xs font-bold text-brandWhite uppercase tracking-wide">About the Artist</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <h3 className="font-bold text-sm text-brandWhite">{currentSong.artist.name}</h3>
            <p className="text-xs text-brandMuted leading-relaxed">
              {artistInfo.bio}
            </p>
            <div className="flex items-center justify-between text-[10px] border-t border-brandElevated/40 pt-3">
              <span className="text-brandMuted uppercase font-bold tracking-wider">Popularity Rank</span>
              <span className="text-brandNeon font-extrabold uppercase">{artistInfo.popularity}% &bull; verified</span>
            </div>
          </div>
        </div>

        {/* 4. Next In Queue */}
        <div className="bg-brandDarkGray border border-brandElevated p-4 rounded-xl space-y-3 shadow-md">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-brandMuted">Next In Queue</p>
          {nextSong ? (
            <div className="flex items-center gap-3">
              <img
                src={nextSong.coverImage}
                alt={nextSong.name}
                className="w-10 h-10 rounded object-cover border border-brandHighlight flex-shrink-0"
              />
              <div className="truncate flex-grow">
                <p className="text-xs font-bold text-brandWhite truncate">{nextSong.name}</p>
                <p className="text-[10px] text-brandMuted truncate">{nextSong.artist.name}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-brandMuted italic font-light">Queue is empty. Add songs to play next!</p>
          )}
        </div>
      </div>
    </div>
  );
}
