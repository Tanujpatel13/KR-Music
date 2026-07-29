import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Song {
  id: string;
  name: string;
  duration: number;
  coverImage: string;
  audioUrl: string;
  artist: { id: string; name: string };
  album?: { id: string; name: string } | null;
}

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  history: Song[];
  likedSongs: Song[];
  isPlaying: boolean;
  duration: number;
  progress: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  isRepeat: boolean; // false = no repeat, true = repeat queue/song (kept for backwards-compatibility)
  repeatMode: 'none' | 'one' | 'all';
  originalQueue: Song[];
  playTrigger: number;
  activeAlbum: any;
  isAlbumPanelOpen: boolean;
  isNowPlayingOpen: boolean;
  isSidebarOpen: boolean;
  isFullscreenPlayerOpen: boolean;
  isSpotifyConnected: boolean;
  spotifyAccessToken: string | null;
  spotifyPlaylists: any[];
  sleepTimerMinutes: number | null;
  sleepTimerTimeLeft: number | null;
  showLyrics: boolean;
}

const initialState: PlayerState = {
  currentSong: null,
  queue: [],
  history: [],
  likedSongs: [],
  isPlaying: false,
  duration: 0,
  progress: 0,
  volume: 0.8,
  isMuted: false,
  isShuffle: false,
  isRepeat: false,
  repeatMode: 'none',
  originalQueue: [],
  playTrigger: 0,
  activeAlbum: null,
  isAlbumPanelOpen: false,
  isNowPlayingOpen: false,
  isSidebarOpen: true,
  isFullscreenPlayerOpen: false,
  isSpotifyConnected: false,
  spotifyAccessToken: null,
  spotifyPlaylists: [],
  sleepTimerMinutes: null,
  sleepTimerTimeLeft: null,
  showLyrics: false,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setActiveAlbum: (state, action: PayloadAction<any>) => {
      state.activeAlbum = action.payload;
      state.isAlbumPanelOpen = true;
    },
    setAlbumPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.isAlbumPanelOpen = action.payload;
    },
    setSong: (state, action: PayloadAction<Song>) => {
      state.currentSong = action.payload;
      state.isPlaying = true;
      state.progress = 0;
      state.duration = action.payload.duration;
      state.isNowPlayingOpen = true;
      state.playTrigger += 1;
      // Add to history if not already the last item
      if (state.history.length === 0 || state.history[state.history.length - 1].id !== action.payload.id) {
        state.history.push(action.payload);
        if (state.history.length > 20) {
          state.history.shift();
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('playbackHistory', JSON.stringify(state.history));
        }
      }
    },
    setHistory: (state, action: PayloadAction<Song[]>) => {
      state.history = action.payload;
    },
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    setPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    addToQueue: (state, action: PayloadAction<Song>) => {
      state.queue.push(action.payload);
      state.originalQueue.push(action.payload);
    },
    setQueue: (state, action: PayloadAction<Song[]>) => {
      state.queue = action.payload;
      state.originalQueue = [...action.payload];
    },
    playNext: (state, action: PayloadAction<{ force?: boolean } | undefined>) => {
      const force = action?.payload?.force ?? false;
      // 1. If repeat mode is 'one' and we have a current song, repeat it
      if (state.repeatMode === 'one' && state.currentSong && !force) {
        state.progress = 0;
        state.playTrigger += 1;
        state.isPlaying = true;
        return;
      }

      // 2. Add current song to history (avoiding consecutive duplicates)
      if (state.currentSong) {
        const lastHistory = state.history[state.history.length - 1];
        if (!lastHistory || lastHistory.id !== state.currentSong.id) {
          state.history.push(state.currentSong);
          if (state.history.length > 20) {
            state.history.shift();
          }
          if (typeof window !== 'undefined') {
            localStorage.setItem('playbackHistory', JSON.stringify(state.history));
          }
        }
      }

      // 3. If queue is empty, check repeat 'all' or stop
      if (state.queue.length === 0) {
        if (state.repeatMode === 'all' && state.originalQueue.length > 0) {
          // Restore queue from original queue
          state.queue = [...state.originalQueue];
        } else {
          // No repeat or empty original queue: stop playback
          state.isPlaying = false;
          state.progress = 0;
          return;
        }
      }

      // 4. Play next song in queue
      let nextIndex = 0;
      if (state.isShuffle) {
        nextIndex = Math.floor(Math.random() * state.queue.length);
      }

      const nextSong = state.queue[nextIndex];
      state.currentSong = nextSong;
      state.isPlaying = true;
      state.progress = 0;
      state.duration = nextSong.duration;
      state.playTrigger += 1;

      // Update queue (remove played song)
      state.queue = state.queue.filter((_, idx) => idx !== nextIndex);
    },
    playPrevious: (state) => {
      // If history has the current song at the end, pop it first
      if (state.currentSong && state.history.length > 0 && state.history[state.history.length - 1].id === state.currentSong.id) {
        state.history.pop();
      }

      if (state.history.length === 0) {
        state.progress = 0;
        state.playTrigger += 1;
        return;
      }

      // Retrieve previous song
      const prevSong = state.history.pop()!;
      
      if (state.currentSong) {
        // Push current song back to front of queue
        state.queue.unshift(state.currentSong);
      }

      state.currentSong = prevSong;
      state.isPlaying = true;
      state.progress = 0;
      state.duration = prevSong.duration;
      state.playTrigger += 1;
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      if (action.payload && !isNaN(action.payload) && isFinite(action.payload)) {
        state.duration = action.payload;
      }
    },

    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
      state.isMuted = action.payload === 0;
    },
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },
    toggleShuffle: (state) => {
      state.isShuffle = !state.isShuffle;
    },
    toggleRepeat: (state) => {
      if (state.repeatMode === 'none') {
        state.repeatMode = 'all';
        state.isRepeat = true;
      } else if (state.repeatMode === 'all') {
        state.repeatMode = 'one';
        state.isRepeat = true;
      } else {
        state.repeatMode = 'none';
        state.isRepeat = false;
      }
    },
    toggleLyrics: (state) => {
      state.showLyrics = !state.showLyrics;
    },
    toggleLikeSong: (state, action: PayloadAction<Song>) => {
      const song = action.payload;
      const exists = state.likedSongs.some((s) => s.id === song.id);
      if (exists) {
        state.likedSongs = state.likedSongs.filter((s) => s.id !== song.id);
      } else {
        state.likedSongs.push(song);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('likedSongs', JSON.stringify(state.likedSongs));
      }
    },
    setLikedSongs: (state, action: PayloadAction<Song[]>) => {
      state.likedSongs = action.payload;
    },
    setNowPlayingOpen: (state, action: PayloadAction<boolean>) => {
      state.isNowPlayingOpen = action.payload;
    },
    toggleNowPlaying: (state) => {
      state.isNowPlayingOpen = !state.isNowPlayingOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setFullscreenPlayerOpen: (state, action: PayloadAction<boolean>) => {
      state.isFullscreenPlayerOpen = action.payload;
    },
    setSpotifyConnected: (state, action: PayloadAction<boolean>) => {
      state.isSpotifyConnected = action.payload;
    },
    setSpotifyAccessToken: (state, action: PayloadAction<string | null>) => {
      state.spotifyAccessToken = action.payload;
    },
    setSpotifyPlaylists: (state, action: PayloadAction<any[]>) => {
      state.spotifyPlaylists = action.payload;
    },
    setSleepTimer: (state, action: PayloadAction<number | null>) => {
      state.sleepTimerMinutes = action.payload;
      state.sleepTimerTimeLeft = action.payload !== null ? action.payload * 60 : null;
    },
    tickSleepTimer: (state) => {
      if (state.sleepTimerTimeLeft !== null) {
        if (state.sleepTimerTimeLeft <= 1) {
          state.sleepTimerTimeLeft = null;
          state.sleepTimerMinutes = null;
          state.isPlaying = false;
        } else {
          state.sleepTimerTimeLeft -= 1;
        }
      }
    },
  },
});

export const {
  setActiveAlbum,
  setAlbumPanelOpen,
  setSong,
  togglePlay,
  setPlaying,
  addToQueue,
  setQueue,
  playNext,
  playPrevious,
  setProgress,
  setDuration,
  setVolume,

  toggleMute,
  toggleShuffle,
  toggleRepeat,
  toggleLyrics,
  toggleLikeSong,
  setLikedSongs,
  setHistory,
  setNowPlayingOpen,
  toggleNowPlaying,
  setSidebarOpen,
  toggleSidebar,
  setFullscreenPlayerOpen,
  setSpotifyConnected,
  setSpotifyAccessToken,
  setSpotifyPlaylists,
  setSleepTimer,
  tickSleepTimer,
} = playerSlice.actions;

export default playerSlice.reducer;
