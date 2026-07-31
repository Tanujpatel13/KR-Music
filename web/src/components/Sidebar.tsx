'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Library, ChevronLeft, User, LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setSidebarOpen } from '../store/playerSlice';

export default function Sidebar() {
  const dispatch = useDispatch();
  const player = useSelector((state: RootState) => state.player);
  const { isSidebarOpen } = player;
  const pathname = usePathname();

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
    <aside className={`fixed top-0 bottom-24 left-0 w-64 bg-black border-r border-brandElevated z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out transform-gpu ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } p-2 text-brandWhite select-none`} style={{ willChange: 'transform' }}>
      
      {/* Top Navigation Section */}
      <div className="bg-[#121212] rounded-xl p-5 space-y-6 flex-shrink-0">
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

        {/* Top Links: Home & Your Library */}
        <nav className="flex flex-col gap-4">
          <Link
            href="/"
            onClick={() => { if (window.innerWidth < 768) dispatch(setSidebarOpen(false)); }}
            className={`flex items-center gap-4 text-sm font-bold transition-all duration-200 ${
              pathname === '/' ? 'text-spotifyGreen' : 'text-brandMuted hover:text-brandWhite'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
          
          <Link
            href="/library"
            onClick={() => { if (window.innerWidth < 768) dispatch(setSidebarOpen(false)); }}
            className={`flex items-center gap-4 text-sm font-bold transition-all duration-200 ${
              pathname === '/library' ? 'text-spotifyGreen' : 'text-brandMuted hover:text-brandWhite'
            }`}
          >
            <Library className="w-5 h-5" />
            <span>Your Library</span>
          </Link>
        </nav>
      </div>

      {/* Bottom Navigation Section: User Profile & Log Out */}
      <div className="bg-[#121212] rounded-xl p-4 flex flex-col gap-2 flex-shrink-0">
        <Link
          href="/profile"
          onClick={() => { if (window.innerWidth < 768) dispatch(setSidebarOpen(false)); }}
          className={`flex items-center gap-4 p-2.5 rounded-lg text-sm font-bold transition-colors ${
            pathname === '/profile' ? 'bg-[#282828] text-spotifyGreen' : 'text-brandMuted hover:bg-[#1a1a1a]/50 hover:text-brandWhite'
          }`}
        >
          <User className="w-5 h-5" />
          <span>User Profile</span>
        </Link>
        
        <button
          onClick={handleInstall}
          className="sm:hidden flex items-center gap-4 p-2.5 rounded-lg text-sm font-bold text-spotifyGreen hover:bg-[#1a1a1a]/50 w-full text-left"
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
          className="flex items-center gap-4 p-2.5 rounded-lg text-sm font-bold text-red-500 hover:bg-red-500/10 hover:text-red-400 w-full text-left transition-colors"
        >
          <LogOut className="w-5 h-5 text-red-500" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

