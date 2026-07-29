'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Library, Plus, Heart, Settings, ShieldAlert, Disc, LogOut, ChevronLeft, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setSidebarOpen } from '../store/playerSlice';
import { usePublicPlaylists } from '../hooks/usePublicPlaylists';

export default function Sidebar() {
  const dispatch = useDispatch();
  const player = useSelector((state: RootState) => state.player);
  const { isSidebarOpen } = player;

  const pathname = usePathname();
  const router = useRouter();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const { playlists: publicPlaylists } = usePublicPlaylists();

  // Merge public playlists + user playlists from localStorage
  useEffect(() => {
    setIsAdmin(true);

    const defaultChillSongs = [
      { id: 'hn1', name: 'Samayama', duration: 278, coverImage: '/static/images/hi_nanna.jpg', audioUrl: '/static/audio/samayama.mp3', artist: { id: 'a6', name: 'Hesham Abdul Wahab' }, album: 'Hi Nanna', genre: 'Romantic Melody', language: 'Telugu' },
      { id: 'ymc2', name: 'Ee Hridayam', duration: 324, coverImage: '/static/images/ye_maaya_chesave.jpg', audioUrl: '/static/audio/ee_hridayam.mp3', artist: { id: 'a9', name: 'A. R. Rahman' }, album: 'Ye Maaya Chesave', genre: 'Romantic Melody', language: 'Telugu' }
    ];
    const defaultFocusSongs = [
      { id: 'mir1', name: 'Mirchi Theme', duration: 85, coverImage: '/static/images/mirchi.jpg', audioUrl: '/static/audio/mirchi_theme.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: 'Mirchi', genre: 'Classical Fusion', language: 'Telugu' },
      { id: 'ssr1', name: 'Pranavalaya', duration: 243, coverImage: '/static/images/shyam_singha_roy.jpg', audioUrl: '/static/audio/pranavalaya.mp3', artist: { id: 'a3', name: 'Anurag Kulkarni' }, album: 'Shyam Singha Roy', genre: 'Classical Fusion', language: 'Telugu' }
    ];
    const defaultStudySongs = [
      { id: 'ary1', name: 'Feel My Love', duration: 290, coverImage: '/static/images/arya.jpg', audioUrl: '/static/audio/feel_my_love.mp3', artist: { id: 'a5', name: 'Devi Sri Prasad' }, album: 'Arya', genre: 'Romantic Melody', language: 'Telugu' },
      { id: 'hn2', name: 'Adigaa', duration: 217, coverImage: '/static/images/hi_nanna.jpg', audioUrl: '/static/audio/adigaa.mp3', artist: { id: 'a6', name: 'Hesham Abdul Wahab' }, album: 'Hi Nanna', genre: 'Romantic Melody', language: 'Telugu' }
    ];

    const loadPlaylists = () => {
      const saved = localStorage.getItem('customPlaylists');
      let currentPlaylists = saved ? JSON.parse(saved) : [];

      let needsUpdate = false;

      // Ensure default playlists exist
      if (!currentPlaylists.find((p: any) => String(p.id) === '1')) {
        currentPlaylists.push({ id: '1', name: 'Chill Beats', description: 'Chill out with these ambient beats.', songs: defaultChillSongs });
        needsUpdate = true;
      }
      if (!currentPlaylists.find((p: any) => String(p.id) === '2')) {
        currentPlaylists.push({ id: '2', name: 'Coding Focus', description: 'Music to keep your brain focused.', songs: defaultFocusSongs });
        needsUpdate = true;
      }
      if (!currentPlaylists.find((p: any) => String(p.id) === '3')) {
        currentPlaylists.push({ id: '3', name: 'Lo-Fi Study', description: 'Lo-fi tracks for studying and relaxing.', songs: defaultStudySongs });
        needsUpdate = true;
      }

      if (needsUpdate) {
        localStorage.setItem('customPlaylists', JSON.stringify(currentPlaylists));
      }
      setPlaylists(currentPlaylists);
    };

    loadPlaylists();
    window.addEventListener('playlists-updated', loadPlaylists);
    return () => window.removeEventListener('playlists-updated', loadPlaylists);
  }, []);

  // When public playlists load, merge into sidebar list
  useEffect(() => {
    if (publicPlaylists.length === 0) return;
    const saved = localStorage.getItem('customPlaylists');
    let current: any[] = saved ? JSON.parse(saved) : [];

    for (const pub of publicPlaylists) {
      const mapped = {
        id: pub.id,
        name: pub.name,
        description: pub.description,
        coverImage: pub.coverImage || pub.previewSongs?.[0]?.coverImage || null,
        songCount: pub.songCount,
        songs: pub.previewSongs || [],
      };
      const idx = current.findIndex((p: any) => String(p.id) === String(pub.id));
      if (idx !== -1) {
        current[idx] = mapped;
      } else {
        current = [mapped, ...current];
      }
    }

    localStorage.setItem('customPlaylists', JSON.stringify(current));
    setPlaylists(current);
  }, [publicPlaylists]);


  const handleCreatePlaylist = () => {
    const name = prompt('Enter a name for your new playlist:');
    if (!name || !name.trim()) return;

    const saved = localStorage.getItem('customPlaylists');
    const currentPlaylists = saved ? JSON.parse(saved) : [];
    const newPlaylist = {
      id: Date.now().toString(),
      name: name.trim(),
      description: `A custom playlist created by KR Listener on ${new Date().toLocaleDateString()}`,
      songs: [],
    };

    const updated = [...currentPlaylists, newPlaylist];
    localStorage.setItem('customPlaylists', JSON.stringify(updated));
    window.dispatchEvent(new Event('playlists-updated'));
    router.push(`/playlist/${newPlaylist.id}`);
  };

  const menuItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Library', href: '/library', icon: Library },
  ];

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
    <aside className={`fixed top-0 bottom-24 left-0 w-64 bg-black border-r border-brandElevated z-50 flex flex-col transition-transform duration-300 ease-in-out transform-gpu ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } p-2 text-brandWhite select-none`} style={{ willChange: 'transform' }}>
      
      {/* 1. Top Navigation Card */}
      <div className="bg-[#121212] rounded-xl p-5 space-y-5 flex-shrink-0">
        {/* Brand Logo & Collapse Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8">
              <img src="/logo.svg" alt="KR Music Logo" className="w-full h-full" />
            </div>
            <span className="text-lg font-black tracking-wider text-brandWhite">
              KR <span className="text-spotifyGreen">MUSIC</span>
            </span>
          </div>
          <button
            onClick={() => dispatch(setSidebarOpen(false))}
            className="p-1.5 rounded-full hover:bg-[#282828] text-brandMuted hover:text-brandWhite transition-all md:hidden"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation Links */}
        <nav className="flex flex-col gap-4">
          <Link
            href="/"
            onClick={() => { if (window.innerWidth < 768) dispatch(setSidebarOpen(false)); }}
            className={`flex items-center gap-5 text-sm font-bold transition-all duration-200 ${
              pathname === '/' ? 'text-spotifyGreen' : 'text-brandMuted hover:text-brandWhite'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link
            href="/search"
            onClick={() => { if (window.innerWidth < 768) dispatch(setSidebarOpen(false)); }}
            className={`flex items-center gap-5 text-sm font-bold transition-all duration-200 ${
              pathname === '/search' ? 'text-spotifyGreen' : 'text-brandMuted hover:text-brandWhite'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>Search</span>
          </Link>
        </nav>
      </div>

      {/* 2. Library & Playlists Card */}
      <div className="bg-[#121212] rounded-xl p-5 mt-2 flex-1 flex flex-col min-h-0 space-y-4">
        {/* Library Header */}
        <div className="flex items-center justify-between text-brandMuted flex-shrink-0">
          <Link
            href="/library"
            onClick={() => { if (window.innerWidth < 768) dispatch(setSidebarOpen(false)); }}
            className={`flex items-center gap-3 font-bold text-sm hover:text-brandWhite transition-colors ${
              pathname === '/library' ? 'text-white' : ''
            }`}
          >
            <Library className="w-5 h-5" />
            <span>Your Library</span>
          </Link>
          <button
            onClick={handleCreatePlaylist}
            className="p-1.5 hover:bg-[#282828] text-brandMuted hover:text-brandWhite rounded-full transition-all"
            title="Create Playlist"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Pinned Liked Songs Card */}
        <Link
          href="/favorites"
          onClick={() => { if (window.innerWidth < 768) dispatch(setSidebarOpen(false)); }}
          className={`flex items-center gap-3.5 p-2 rounded-lg transition-all flex-shrink-0 ${
            pathname === '/favorites' ? 'bg-[#282828] text-spotifyGreen' : 'hover:bg-[#1a1a1a]/50 text-brandWhite'
          }`}
        >
          <div className="w-10 h-10 rounded bg-gradient-to-br from-[#450e71] to-[#8e8ee8] flex items-center justify-center flex-shrink-0 shadow-md">
            <Heart className="w-5 h-5 text-brandWhite fill-brandWhite" />
          </div>
          <div className="truncate">
            <p className="text-xs font-extrabold truncate">Liked Songs</p>
            <p className="text-[10px] text-brandMuted font-bold">
              Playlist &bull; {player.likedSongs?.length || 0} songs
            </p>
          </div>
        </Link>

        {/* Scrollable Playlists Sub-List */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-none space-y-1">
          {playlists.map((playlist) => {
            const isPlaylistActive = pathname === `/playlist/${playlist.id}`;
            return (
              <Link
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                onClick={() => { if (window.innerWidth < 768) dispatch(setSidebarOpen(false)); }}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors truncate ${
                  isPlaylistActive ? 'bg-[#282828] text-spotifyGreen font-bold' : 'hover:bg-[#1a1a1a]/50 text-brandMuted hover:text-brandWhite'
                }`}
              >
                <Disc className={`w-4 h-4 flex-shrink-0 ${
                  isPlaylistActive ? 'text-spotifyGreen animate-spin-slow' : 'text-brandMuted'
                }`} />
                <span className="text-xs font-semibold truncate">{playlist.name}</span>
              </Link>
            );
          })}
          {playlists.length === 0 && (
            <p className="text-[10px] text-brandMuted italic p-2">No playlists yet. Create one!</p>
          )}
        </div>

        {/* Bottom Pinned User & Admin Navigation Actions */}
        <div className="pt-3 border-t border-brandElevated flex flex-col gap-1 flex-shrink-0">
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => { if (window.innerWidth < 768) dispatch(setSidebarOpen(false)); }}
              className={`flex items-center gap-4 p-2 rounded-lg text-sm font-semibold transition-colors ${
                pathname === '/admin' ? 'bg-[#282828] text-yellow-500' : 'text-yellow-500 hover:bg-[#1a1a1a]/50 hover:text-yellow-400'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
              <span>Admin Dashboard</span>
            </Link>
          )}
          <Link
            href="/profile"
            onClick={() => { if (window.innerWidth < 768) dispatch(setSidebarOpen(false)); }}
            className={`flex items-center gap-4 p-2 rounded-lg text-sm font-semibold transition-colors ${
              pathname === '/profile' ? 'bg-[#282828] text-spotifyGreen' : 'text-brandMuted hover:bg-[#1a1a1a]/50 hover:text-brandWhite'
            }`}
          >
            <User className="w-5 h-5" />
            <span>User Profile</span>
          </Link>
          <Link
            href="/premium"
            onClick={() => { if (window.innerWidth < 768) dispatch(setSidebarOpen(false)); }}
            className={`flex items-center gap-4 p-2 rounded-lg text-sm font-semibold transition-colors ${
              pathname === '/premium' ? 'bg-[#282828] text-spotifyGreen' : 'text-spotifyGreen hover:bg-[#1a1a1a]/50 hover:brightness-110'
            }`}
          >
            <Settings className="w-5 h-5 text-spotifyGreen" />
            <span>Upgrade to Premium</span>
          </Link>
          <button
            onClick={handleInstall}
            className="sm:hidden flex items-center gap-4 p-2 rounded-lg text-sm font-semibold text-spotifyGreen hover:bg-[#1a1a1a]/50 hover:brightness-110 w-full text-left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            <span>Download App</span>
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('isLoggedIn');
                window.location.href = '/login';
              }
            }}
            className="flex items-center gap-4 p-2 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-500/10 hover:text-red-400 w-full text-left transition-colors"
          >
            <LogOut className="w-5 h-5 text-red-500" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
