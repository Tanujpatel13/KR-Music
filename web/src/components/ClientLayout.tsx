'use client';

import Sidebar from './Sidebar';
import PlayerBar from './PlayerBar';
import AuthGuard from './AuthGuard';
import SlidingAlbumPanel from './SlidingAlbumPanel';
import NowPlayingPanel from './NowPlayingPanel';
import FullscreenPlayer from './FullscreenPlayer';
import AiChatbotModal from './AiChatbotModal';

import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { 
  setSidebarOpen, 
  setNowPlayingOpen, 
  setAlbumPanelOpen, 
  toggleSidebar, 
  toggleNowPlaying,
  setSpotifyConnected,
  setSpotifyAccessToken,
  setSpotifyPlaylists
} from '../store/playerSlice';
import { Menu, Disc, Music, Home, Search, Library, User, ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { fetchSpotifyUserProfile, fetchSpotifyPlaylists } from '../lib/spotifyService';
import Link from 'next/link';

const getPageTitle = (pathname: string) => {
  if (pathname === '/') return 'Home';
  if (pathname === '/search') return 'Search Music';
  if (pathname === '/library') return 'Your Library';
  if (pathname === '/favorites') return 'Liked Songs';
  if (pathname === '/admin') return 'Admin Dashboard';
  if (pathname === '/premium') return 'Premium Upgrade';
  if (pathname === '/profile') return 'User Profile';
  if (pathname.startsWith('/artist/')) return 'Artist Profile';
  if (pathname.startsWith('/playlist/')) return 'Playlist View';
  return 'KR Music';
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';
  const dispatch = useDispatch();

  const player = useSelector((state: RootState) => state.player);
  const { isSidebarOpen, isNowPlayingOpen, isAlbumPanelOpen, isPlaying, currentSong } = player;

  const isRightPanelOpen = isNowPlayingOpen || isAlbumPanelOpen;

  // Intercept and initialize Spotify Connection states
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const parseSpotifyHash = async () => {
      if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const token = params.get('access_token');
        const expires = params.get('expires_in');
        
        if (token) {
          localStorage.setItem('spotify_access_token', token);
          const expiryTime = Date.now() + parseInt(expires || '3600') * 1000;
          localStorage.setItem('spotify_token_expiry', expiryTime.toString());
          localStorage.setItem('spotify_connected_mode', 'real');
          
          dispatch(setSpotifyAccessToken(token));
          dispatch(setSpotifyConnected(true));
          
          // Clear hash from URL
          window.history.replaceState(null, '', window.location.pathname);
          
          // Trigger playlists load event
          window.dispatchEvent(new Event('spotify-connection-changed'));
          
          // Fetch and store profile
          const profile = await fetchSpotifyUserProfile(token);
          if (profile) {
            localStorage.setItem('spotify_user_profile', JSON.stringify(profile));
          }
          return;
        }
      }

      // Check existing token
      const storedToken = localStorage.getItem('spotify_access_token');
      const expiry = localStorage.getItem('spotify_token_expiry');
      const mode = localStorage.getItem('spotify_connected_mode');

      if (mode === 'simulated') {
        dispatch(setSpotifyConnected(true));
      } else if (storedToken && expiry && Date.now() < parseInt(expiry)) {
        dispatch(setSpotifyAccessToken(storedToken));
        dispatch(setSpotifyConnected(true));
      } else {
        // Clear expired token if real
        if (mode === 'real') {
          localStorage.removeItem('spotify_access_token');
          localStorage.removeItem('spotify_token_expiry');
          localStorage.removeItem('spotify_connected_mode');
          localStorage.removeItem('spotify_user_profile');
          dispatch(setSpotifyConnected(false));
          dispatch(setSpotifyAccessToken(null));
        }
      }
    };

    parseSpotifyHash();

    // Listen for manual logins/logouts
    const handleSpotifyUpdate = () => {
      const mode = localStorage.getItem('spotify_connected_mode');
      const token = localStorage.getItem('spotify_access_token');
      if (mode === 'simulated') {
        dispatch(setSpotifyConnected(true));
      } else if (mode === 'real' && token) {
        dispatch(setSpotifyAccessToken(token));
        dispatch(setSpotifyConnected(true));
      } else {
        dispatch(setSpotifyConnected(false));
        dispatch(setSpotifyAccessToken(null));
      }
    };

    window.addEventListener('spotify-connection-changed', handleSpotifyUpdate);
    return () => window.removeEventListener('spotify-connection-changed', handleSpotifyUpdate);
  }, [dispatch]);

  // Dynamic color matching theme effect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    if (currentSong) {
      const artistId = currentSong.artist?.id || 'default';
      const colors: Record<string, string> = {
        'a1': '232, 17, 86',       // Kesariya/Hindi - rose
        'a2': '16, 185, 129',      // Srivalli - emerald
        'a3': '13, 148, 136',      // Sirivennela - teal
        'a4': '59, 130, 246',      // Shyam Singha Roy - royal blue
        'a5': '239, 68, 68',       // Pushpa/DSP - red
        'a6': '245, 158, 11',      // Hi Nanna/Hesham - amber
        'a7': '29, 78, 216',       // Magadheera/Keeravani - blue
        'a8': '101, 163, 13',      // Geetha Govindham - lime
        'a9': '6, 182, 212',       // Ye Maaya Chesave/ARR - cyan
        'a10': '147, 51, 234',     // Ala Vaikunthapurramuloo/Thaman - purple
        'a11': '236, 72, 153',     // Orange/Harris - pink
        'a12': '16, 185, 129',     // V/Amit - emerald
        'a13': '219, 39, 119',     // Darling/Prakash - pink-purple
        'a14': '244, 63, 94',      // Arjun/Mani - rose
        'a99': '29, 185, 84',      // SoundHelix - Spotify green
      };
      const themeColor = colors[artistId] || '29, 185, 84';
      root.style.setProperty('--theme-glow-color', themeColor);
      root.style.setProperty('--theme-glow-bg-color', `rgba(${themeColor}, 0.14)`);
    } else {
      root.style.setProperty('--theme-glow-color', '29, 185, 84');
      root.style.setProperty('--theme-glow-bg-color', 'rgba(29, 185, 84, 0.12)');
    }
  }, [currentSong]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handler);
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.error('SW Registration Failed:', err));
    }
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = (e: React.MouseEvent) => {
    e.preventDefault();
    const promptEvent = (window as any).deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      promptEvent.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          (window as any).deferredPrompt = null;
        }
      });
    } else {
      alert("To install, look for the 'Add to Home Screen' option in your browser menu, or it may already be installed!");
    }
  };

  return (
    <AuthGuard>
      {isLoginPage ? (
        <main className="flex-grow h-screen overflow-y-auto bg-[#121212]">
          {children}
        </main>
      ) : (
        <>
          <div className="flex flex-1 h-screen w-full overflow-hidden relative">
            {/* Sidebar Left Pane (slides out from the left) */}
            <Sidebar />

            {/* Backdrop Overlay for closing Sidebar on mobile */}
            {isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-all duration-300 cursor-pointer md:hidden"
                onClick={() => dispatch(setSidebarOpen(false))}
              />
            )}

            {/* Backdrop Overlay for closing panels */}
            {isRightPanelOpen && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs z-35 transition-all duration-300 cursor-pointer"
                onClick={() => {
                  if (isNowPlayingOpen) dispatch(setNowPlayingOpen(false));
                  if (isAlbumPanelOpen) dispatch(setAlbumPanelOpen(false));
                }}
              />
            )}

            {/* Now Playing Panel (slides out from the right side) */}
            <NowPlayingPanel />

            {/* Sliding Album Track list panel */}
            <SlidingAlbumPanel />

            {/* Content Display Area with Apple Ambient Mesh Lighting */}
            <main 
              className={`flex-1 overflow-y-auto bg-[#09090b] relative flex flex-col transition-[margin] duration-300 ease-in-out transform-gpu ${isSidebarOpen ? 'md:ml-64' : 'ml-0'} pb-28`}
              style={{ willChange: 'margin' }}
            >
              {/* Apple Ambient Frosted Glow Mesh */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/20 blur-[130px]" />
                <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[150px]" />
                <div className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full bg-teal-400/15 blur-[120px]" />
              </div>

              {/* Sticky Top Header with Navigation Arrows & Toggles */}
              <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#0b0b0b]/60 backdrop-blur-xl border-b border-white/5 select-none flex-shrink-0">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => dispatch(toggleSidebar())}
                    className="flex md:hidden items-center gap-2 p-2 rounded-full hover:bg-[#282828] transition-all text-brandWhite active:scale-95"
                    title="Toggle Sidebar Menu"
                  >
                    <Menu className="w-5 h-5 text-brandWhite" />
                  </button>
                  
                  {/* Desktop Spotify-like Navigation Arrows & Header Search Bar */}
                  <div className="hidden md:flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => router.back()}
                        className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-brandWhite/70 hover:text-brandWhite transition-all active:scale-95"
                        title="Go Back"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => router.forward()}
                        className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-brandWhite/70 hover:text-brandWhite transition-all active:scale-95"
                        title="Go Forward"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Search Bar beside arrows */}
                    <div className="relative flex items-center">
                      <Search className="w-4 h-4 text-brandMuted absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="What do you want to play?"
                        onChange={(e) => {
                          if (e.target.value.trim()) {
                            router.push(`/search?q=${encodeURIComponent(e.target.value)}`);
                          }
                        }}
                        className="bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] text-white text-xs font-semibold rounded-full pl-9 pr-4 py-2 w-48 sm:w-64 border border-white/10 focus:border-spotifyGreen outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-spotifyGreen animate-pulse" />
                  <h1 className="text-xs font-extrabold uppercase tracking-widest text-spotifyGreen">
                    {getPageTitle(pathname)}
                  </h1>
                </div>

                <div className="flex items-center gap-4">
                  <button onClick={handleInstall} className="hidden sm:flex items-center gap-2 bg-[#1DB954]/10 hover:bg-[#1DB954]/20 text-spotifyGreen px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-spotifyGreen/20">
                    Download App
                  </button>
                </div>
              </header>

              <div className="flex-1">
                {children}
              </div>
            </main>
          </div>

          {/* Bottom Mobile Tab Bar Menu */}
          <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#181818]/95 backdrop-blur-md border-t border-white/5 flex items-center justify-around z-50 md:hidden select-none">
            <Link 
              href="/" 
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${pathname === '/' ? 'text-spotifyGreen' : 'text-brandMuted'}`}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link 
              href="/search" 
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${pathname === '/search' ? 'text-spotifyGreen' : 'text-brandMuted'}`}
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </Link>
            <Link 
              href="/library" 
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${pathname === '/library' || pathname === '/favorites' || pathname.startsWith('/playlist/') ? 'text-spotifyGreen' : 'text-brandMuted'}`}
            >
              <Library className="w-5 h-5" />
              <span>Library</span>
            </Link>
            <Link 
              href="/profile" 
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${pathname === '/profile' ? 'text-spotifyGreen' : 'text-brandMuted'}`}
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
          </nav>

          {/* Bottom Player Overlay */}
          <PlayerBar />
          <FullscreenPlayer />
          <AiChatbotModal />
        </>
      )}
    </AuthGuard>
  );
}

