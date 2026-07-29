'use client';

import { useState, useEffect } from 'react';
import { Mail, Lock, User, Chrome, Apple, Facebook, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Google OAuth States
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);
  const [googleAuthSuccess, setGoogleAuthSuccess] = useState<string | null>(null);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');

  // Handle Google OAuth hash callback on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('google_custom_client_id');
      if (saved) {
        setGoogleClientId(saved);
      }

      if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const error = params.get('error');

        if (accessToken) {
          window.history.replaceState(null, '', window.location.pathname);
          handleGoogleCallback(accessToken);
        } else if (error) {
          setGoogleAuthError(`Google Sign-In failed: ${error}`);
        }
      }
    }
  }, []);

  const handleGoogleCallback = async (accessToken: string) => {
    setIsLoadingGoogle(true);
    setGoogleAuthError(null);
    try {
      // Fetch profile from Google userinfo
      const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      if (!res.ok) throw new Error('Failed to retrieve Google profile');
      const googleUser = await res.json();

      // Exchange with backend
      const backendRes = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          email: googleUser.email,
          username: googleUser.name,
          id: googleUser.sub
        })
      });

      if (!backendRes.ok) {
        const errData = await backendRes.json();
        throw new Error(errData.error || 'Authentication with KR Music server failed');
      }

      const authData = await backendRes.json();
      
      // Store session
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('jwt_token', authData.accessToken);
      localStorage.setItem('user_profile_data', JSON.stringify({
        username: authData.user.username,
        email: authData.user.email,
        bio: 'Authenticated via Google Account.',
        avatar: googleUser.picture || authData.user.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300'
      }));

      setGoogleAuthSuccess('Successfully logged in via Google!');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setGoogleAuthError(err.message || 'Google OAuth integration failed.');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleGoogleOAuthRedirect = () => {
    const clientId = googleClientId.trim() || '1019084795328-mockclientid.apps.googleusercontent.com';
    localStorage.setItem('google_custom_client_id', clientId);
    const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=email%20profile`;
    setIsGoogleModalOpen(false);
    window.location.href = authUrl;
  };

  const handleSimulatedGoogleConnect = async () => {
    setIsLoadingGoogle(true);
    setGoogleAuthError(null);
    try {
      const mockEmail = `listener_${Math.floor(100 + Math.random() * 900)}@gmail.com`;
      const mockUsername = 'Google Listener';
      const mockId = `google_simulated_${Date.now()}`;

      const backendRes = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          email: mockEmail,
          username: mockUsername,
          id: mockId
        })
      });

      if (!backendRes.ok) {
        const errData = await backendRes.json();
        throw new Error(errData.error || 'Simulated backend authentication failed');
      }

      const authData = await backendRes.json();
      
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('jwt_token', authData.accessToken);
      localStorage.setItem('user_profile_data', JSON.stringify({
        username: authData.user.username,
        email: authData.user.email,
        bio: 'Authenticated via Google Account (Simulated Sandbox).',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300'
      }));

      setGoogleAuthSuccess('Successfully logged in (Simulated Google Sandbox)!');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setGoogleAuthError(err.message || 'Simulated Google sign-in failed.');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user_profile_data', JSON.stringify({
        username: email.split('@')[0],
        email: email,
        bio: 'Welcome to KR Music!',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300'
      }));
    }
    // Simulate login redirect in development
    window.location.href = '/';
  };

  const handleSocialLogin = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', 'true');
    }
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-brandBg text-brandWhite flex items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Decorative Neon Blurs */}
      <div className="absolute w-96 h-96 bg-brandNeon/10 rounded-full blur-[100px] -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-96 h-96 bg-brandNeon/5 rounded-full blur-[120px] -bottom-20 -right-20 pointer-events-none" />

      {/* Main Glassmorphic Card Container */}
      <div className="w-full max-w-md bg-brandDarkGray/60 border border-brandHighlight/80 p-8 rounded-2xl shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <img src="/logo.svg" alt="KR Music Logo" className="w-14 h-14 animate-pulse" />
          <h1 className="text-2xl font-bold tracking-wider">
            KR <span className="text-brandNeon">MUSIC</span>
          </h1>
          <p className="text-xs text-brandMuted">
            {isRegister ? 'Join millions streaming high-fidelity audio' : 'Login to resume your soundtracks'}
          </p>
        </div>

        {/* Auth Error & Success banners */}
        {googleAuthError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs text-center font-semibold">
            {googleAuthError}
          </div>
        )}
        {googleAuthSuccess && (
          <div className="p-3 bg-brandNeon/10 border border-brandNeon/20 text-brandNeon rounded-xl text-xs text-center font-bold">
            {googleAuthSuccess}
          </div>
        )}
        {isLoadingGoogle && (
          <div className="flex items-center justify-center gap-2 text-brandNeon text-xs font-bold py-2">
            <div className="w-4 h-4 border-2 border-brandNeon border-t-transparent rounded-full animate-spin" />
            Connecting Google authentication...
          </div>
        )}

        {/* Input Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-brandMuted" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-brandElevated border border-brandHighlight/40 focus:border-brandNeon rounded-xl py-3 pl-12 pr-4 text-sm text-brandWhite placeholder-brandMuted outline-none transition-colors"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-brandMuted" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-brandElevated border border-brandHighlight/40 focus:border-brandNeon rounded-xl py-3 pl-12 pr-4 text-sm text-brandWhite placeholder-brandMuted outline-none transition-colors"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-brandMuted" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-brandElevated border border-brandHighlight/40 focus:border-brandNeon rounded-xl py-3 pl-12 pr-4 text-sm text-brandWhite placeholder-brandMuted outline-none transition-colors"
              required
            />
          </div>

          {/* Session settings */}
          {!isRegister && (
            <div className="flex items-center justify-between text-xs text-brandMuted px-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-brandNeon"
                />
                Remember me
              </label>
              <a href="#" className="hover:text-brandWhite transition-colors">Forgot Password?</a>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full bg-brandNeon hover:brightness-110 text-brandBg font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <span>{isRegister ? 'Create Account' : 'Log In'}</span>
            <ArrowRight className="w-4 h-4 text-brandBg" />
          </button>
        </form>

        {/* Divider separator */}
        <div className="relative flex py-2 items-center text-xs text-brandMuted">
          <div className="flex-grow border-t border-brandElevated"></div>
          <span className="flex-shrink mx-4">or continue with</span>
          <div className="flex-grow border-t border-brandElevated"></div>
        </div>

        {/* Social Authentication icons grid */}
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => setIsGoogleModalOpen(true)}
            className="flex justify-center items-center py-2.5 bg-brandElevated hover:bg-brandHighlight border border-brandHighlight/60 hover:border-brandNeon/30 rounded-xl transition-colors"
            title="Login with Google"
          >
            <Chrome className="w-5 h-5 text-brandWhite" />
          </button>
          <button 
            onClick={handleSocialLogin}
            className="flex justify-center items-center py-2.5 bg-brandElevated hover:bg-brandHighlight border border-brandHighlight/60 hover:border-brandNeon/30 rounded-xl transition-colors"
          >
            <Apple className="w-5 h-5 text-brandWhite fill-brandWhite" />
          </button>
          <button 
            onClick={handleSocialLogin}
            className="flex justify-center items-center py-2.5 bg-brandElevated hover:bg-brandHighlight border border-brandHighlight/60 hover:border-brandNeon/30 rounded-xl transition-colors"
          >
            <Facebook className="w-5 h-5 text-brandWhite fill-brandWhite" />
          </button>
        </div>

        {/* Switch forms anchor */}
        <p className="text-center text-xs text-brandMuted">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-brandNeon font-bold hover:underline ml-1"
          >
            {isRegister ? 'Sign In' : 'Sign Up Free'}
          </button>
        </p>
      </div>

      {/* Elegant Google Sign-In Authorization Modal */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
          <div 
            className="w-full max-w-md bg-brandElevated border border-brandHighlight p-6 rounded-2xl shadow-2xl relative space-y-6 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-brandNeon/20 text-brandNeon rounded-full flex items-center justify-center mx-auto shadow-md">
                <Chrome className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-brandWhite">Sign in with Google</h3>
              <p className="text-xs text-brandMuted">
                Connect your Google account to log into KR Music.
              </p>
            </div>

            <div className="space-y-4">
              {/* Option 1: Quick connect */}
              <button
                onClick={handleSimulatedGoogleConnect}
                className="w-full py-3 bg-brandNeon hover:brightness-110 text-brandBg font-black rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-md"
              >
                Quick Connect (Simulated Google Account)
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-brandHighlight"></div>
                <span className="flex-shrink mx-4 text-[10px] text-brandMuted font-extrabold uppercase">OR CONNECT TO LIVE GOOGLE CLIENT</span>
                <div className="flex-grow border-t border-brandHighlight"></div>
              </div>

              {/* Option 2: Live API credentials */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-brandMuted uppercase tracking-wider block">
                  Google Client ID
                </label>
                <input
                  type="text"
                  placeholder="Enter Google Client ID"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brandDarkGray border border-brandHighlight focus:border-brandNeon/70 text-xs rounded-xl focus:outline-none text-brandWhite placeholder-brandMuted/50 font-medium transition-colors"
                />
              </div>

              <button
                onClick={handleGoogleOAuthRedirect}
                className="w-full py-3 bg-brandWhite hover:bg-brandWhite/90 text-black font-black rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-md"
              >
                Redirect to Google OAuth
              </button>
            </div>

            <button
              onClick={() => setIsGoogleModalOpen(false)}
              className="w-full py-2.5 text-xs text-brandMuted hover:text-brandWhite transition-colors font-bold uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
