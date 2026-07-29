'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn && pathname !== '/login') {
          setAuthorized(false);
          router.replace('/login');
        } else {
          setAuthorized(true);
        }
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Prevent flash of content for unauthenticated users
  if (!authorized && pathname !== '/login') {
    return (
      <div className="min-h-screen bg-brandBg flex items-center justify-center select-none">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo.svg" alt="Loading Logo" className="w-16 h-16 animate-pulse" />
          <div className="w-8 h-8 border-2 border-brandNeon border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
