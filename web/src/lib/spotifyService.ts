// Spotify Integration Service
// Supports both the live Spotify Web API (Implicit Grant) and simulated sandbox mode

export const DEFAULT_CLIENT_ID = 'e7b0a7dd95b94f1f8df932822a159954'; // Standard mockable client ID

export function getSpotifyAuthUrl(customClientId?: string): string {
  if (typeof window === 'undefined') return '';
  const clientId = (customClientId && customClientId.trim()) || DEFAULT_CLIENT_ID;
  const redirectUri = encodeURIComponent(`${window.location.origin}/`);
  const scopes = encodeURIComponent(
    'user-library-read playlist-read-private playlist-read-collaborative user-read-private user-read-email'
  );
  return `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scopes}`;
}

export async function fetchSpotifyUserProfile(token: string) {
  try {
    const res = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return await res.json();
  } catch (error) {
    console.error('Error fetching Spotify user:', error);
    return null;
  }
}

export async function fetchSpotifyPlaylists(token: string) {
  try {
    const res = await fetch('https://api.spotify.com/v1/me/playlists?limit=20', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch playlists');
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching Spotify playlists:', error);
    return [];
  }
}

export async function fetchSpotifyPlaylistTracks(token: string, playlistId: string) {
  try {
    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=30`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch tracks');
    const data = await res.json();
    
    // Map Spotify tracks to KR Music local Song format
    return (data.items || [])
      .filter((item: any) => item.track)
      .map((item: any, idx: number) => {
        const t = item.track;
        const fallbackAudioUrl = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(idx % 12) + 1}.mp3`;
        return {
          id: `spotify_${t.id || idx}`,
          name: t.name,
          duration: Math.floor(t.duration_ms / 1000),
          coverImage: t.album?.images?.[0]?.url || '/static/images/sirivennela.jpg',
          // Use preview_url if available, else fallback to high quality SoundHelix stream
          audioUrl: t.preview_url || fallbackAudioUrl,
          artist: {
            id: t.artists?.[0]?.id || `artist_${idx}`,
            name: t.artists?.[0]?.name || 'Spotify Artist',
          },
          album: {
            id: t.album?.id || `album_${idx}`,
            name: t.album?.name || 'Spotify Album',
          },
        };
      });
  } catch (error) {
    console.error('Error fetching Spotify tracks:', error);
    return [];
  }
}

// -----------------------------------------------------------------
// Simulated Sandbox Data (Instant connect fallback for demoing)
// -----------------------------------------------------------------

export const MOCK_SPOTIFY_USER = {
  display_name: 'Premium KR Listener',
  images: [{ url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop' }],
  product: 'premium',
  id: 'spotify_simulated_user',
};

export const MOCK_SPOTIFY_PLAYLISTS = [
  {
    id: 'spot_mock_1',
    name: 'Spotify Liked Songs (Synced)',
    description: 'Your favorite tracks imported from Spotify.',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop',
    songs: [
      {
        id: 'spot_song_1',
        name: 'Retro Wave Drive',
        duration: 198,
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        artist: { id: 'sa1', name: 'Synth Runner' },
        album: { id: 'salb1', name: 'Outrun Memories' },
      },
      {
        id: 'spot_song_2',
        name: 'Lofi Chill Study',
        duration: 215,
        coverImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        artist: { id: 'sa2', name: 'Sleepy Beats' },
        album: { id: 'salb2', name: 'Midnight Coffee' },
      },
      {
        id: 'spot_song_3',
        name: 'Acoustic Sunrise',
        duration: 172,
        coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        artist: { id: 'sa3', name: 'Amber Glow' },
        album: { id: 'salb3', name: 'Golden hour' },
      },
    ],
  },
  {
    id: 'spot_mock_2',
    name: 'Aura Chill Lofi',
    description: 'Relax and unwind with these ambient lo-fi tracks.',
    coverImage: 'https://images.unsplash.com/photo-1487180144351-b8472da7a4c3?w=300&auto=format&fit=crop',
    songs: [
      {
        id: 'spot_song_4',
        name: 'Neo Pulse Journey',
        duration: 242,
        coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
        artist: { id: 'sa4', name: 'Pulse Wave' },
        album: { id: 'salb4', name: 'Virtual Worlds' },
      },
      {
        id: 'spot_song_5',
        name: 'Distant Horizon',
        duration: 189,
        coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
        artist: { id: 'sa5', name: 'Dream State' },
        album: { id: 'salb5', name: 'Nebula Suite' },
      },
    ],
  },
  {
    id: 'spot_mock_3',
    name: 'Global Top Hits 2026',
    description: 'The hot new releases globally.',
    coverImage: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&auto=format&fit=crop',
    songs: [
      {
        id: 'spot_song_6',
        name: 'Electric Pulse Energy',
        duration: 254,
        coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
        artist: { id: 'sa6', name: 'Club Bangerz' },
        album: { id: 'salb6', name: 'Dance Arena' },
      },
      {
        id: 'spot_song_7',
        name: 'Jazz Lounge Breeze',
        duration: 219,
        coverImage: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&auto=format&fit=crop',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
        artist: { id: 'sa7', name: 'Vibe Quintet' },
        album: { id: 'salb7', name: 'Late Night Sessions' },
      },
    ],
  },
];
