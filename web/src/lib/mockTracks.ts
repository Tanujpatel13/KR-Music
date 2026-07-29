import { MOCK_ALBUMS } from './mockAlbums';

export interface Track {
  id: string;
  name: string;
  duration: number;
  coverImage: string;
  audioUrl: string;
  artist: { id: string; name: string };
  album: string;
  genre: string;
  language: string;
}

export const OPEN_SOURCE_TRACKS = [
  {
    id: 'os1',
    name: 'Electronic Summer',
    duration: 180,
    coverImage: '/static/images/popular_hits.jpg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    artist: { id: 'a99', name: 'SoundHelix' },
    album: 'Popular Hits',
    genre: 'Electronic',
    language: 'English',
  },
  {
    id: 'os2',
    name: 'Chill Synthwave',
    duration: 210,
    coverImage: '/static/images/popular_hits.jpg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    artist: { id: 'a99', name: 'SoundHelix' },
    album: 'Popular Hits',
    genre: 'Synthwave',
    language: 'English',
  },
  {
    id: 'os3',
    name: 'Deep Bass Drop',
    duration: 240,
    coverImage: '/static/images/popular_hits.jpg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    artist: { id: 'a99', name: 'SoundHelix' },
    album: 'Popular Hits',
    genre: 'Dance Pop',
    language: 'English',
  },
  {
    id: 'os4',
    name: 'Ambient Relax',
    duration: 195,
    coverImage: '/static/images/popular_hits.jpg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    artist: { id: 'a99', name: 'SoundHelix' },
    album: 'Popular Hits',
    genre: 'Ambient',
    language: 'English',
  },
  {
    id: 'os5',
    name: 'Upbeat Tech',
    duration: 265,
    coverImage: '/static/images/popular_hits.jpg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    artist: { id: 'a99', name: 'SoundHelix' },
    album: 'Popular Hits',
    genre: 'Electronic',
    language: 'English',
  },
  {
    id: 'os6',
    name: 'Midnight Outrun',
    duration: 198,
    coverImage: '/static/images/popular_hits.jpg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    artist: { id: 'a99', name: 'SoundHelix' },
    album: 'Popular Hits',
    genre: 'Synthwave',
    language: 'English',
  },
  {
    id: 'os7',
    name: 'Lofi Sleep Cafe',
    duration: 215,
    coverImage: '/static/images/popular_hits.jpg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    artist: { id: 'a99', name: 'SoundHelix' },
    album: 'Popular Hits',
    genre: 'Lofi',
    language: 'English',
  },
  {
    id: 'os8',
    name: 'Golden Hour Acoustic',
    duration: 172,
    coverImage: '/static/images/popular_hits.jpg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    artist: { id: 'a99', name: 'SoundHelix' },
    album: 'Popular Hits',
    genre: 'Acoustic',
    language: 'English',
  },
  {
    id: 'os9',
    name: 'Virtual Neon Pulse',
    duration: 242,
    coverImage: '/static/images/popular_hits.jpg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    artist: { id: 'a99', name: 'SoundHelix' },
    album: 'Popular Hits',
    genre: 'Electronic',
    language: 'English',
  },
  {
    id: 'os10',
    name: 'Dream State Horizon',
    duration: 189,
    coverImage: '/static/images/popular_hits.jpg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    artist: { id: 'a99', name: 'SoundHelix' },
    album: 'Popular Hits',
    genre: 'Ambient',
    language: 'English',
  },
  {
    id: 'os11',
    name: 'Club Dance Arena',
    duration: 254,
    coverImage: '/static/images/popular_hits.jpg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    artist: { id: 'a99', name: 'SoundHelix' },
    album: 'Popular Hits',
    genre: 'Dance Pop',
    language: 'English',
  },
  {
    id: 'os12',
    name: 'Late Night Jazz Session',
    duration: 219,
    coverImage: '/static/images/popular_hits.jpg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    artist: { id: 'a99', name: 'SoundHelix' },
    album: 'Popular Hits',
    genre: 'Jazz',
    language: 'English',
  },
];

// Compile all songs inside MOCK_ALBUMS dynamically into track catalog
const compileTracks = (): Track[] => {
  const catalog: Track[] = [];
  
  MOCK_ALBUMS.forEach((album) => {
    // Skip popular_hits metadata to avoid duplicate listings (since they exist in original albums)
    if (album.id === 'popular_hits') return;

    album.songs.forEach((song) => {
      // Map composer IDs accurately
      let artistId = 'a5'; // Default Devi Sri Prasad
      const composer = album.artist.toLowerCase();
      if (composer.includes('rahman')) artistId = 'a9';
      else if (composer.includes('keeravani')) artistId = 'a7';
      else if (composer.includes('mickey')) artistId = 'a4';
      else if (composer.includes('hesham')) artistId = 'a6';
      else if (composer.includes('thaman')) artistId = 'a10';
      else if (composer.includes('harris')) artistId = 'a11';
      else if (composer.includes('trivedi')) artistId = 'a12';
      else if (composer.includes('prakash')) artistId = 'a13';
      else if (composer.includes('sharma')) artistId = 'a14';
      else if (composer.includes('gopi')) artistId = 'a8';
      
      // Determine track language
      let language = 'Telugu';
      if (song.id.startsWith('bah8') || song.id.startsWith('os')) {
        language = 'English';
      }

      catalog.push({
        id: song.id,
        name: song.name,
        duration: song.duration,
        coverImage: album.coverImage,
        audioUrl: song.audioUrl || `/static/audio/${song.id}.mp3`,
        artist: { id: artistId, name: album.artist },
        album: album.name,
        genre: song.genre || 'Romantic Melody',
        language,
      });
    });
  });
  
  return catalog;
};

export const MOCK_TRACKS: Track[] = [
  ...compileTracks(),
  ...OPEN_SOURCE_TRACKS
];
