'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Award, Edit, Check, Disc, Heart, Play, ArrowLeft } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setSong, setQueue, togglePlay } from '../../store/playerSlice';
import Link from 'next/link';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const player = useSelector((state: RootState) => state.player);

  const [username, setUsername] = useState('KR Listener');
  const [email, setEmail] = useState('listener@kr-music.com');
  const [bio, setBio] = useState('Streaming lossless cinema soundtracks. Passionate about Telugu and Hindi cinematic records.');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300');
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Edit fields
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  const [stats, setStats] = useState({
    playedCount: 0,
    playlistsCount: 0,
    likedCount: 0,
  });

  const [isPremium, setIsPremium] = useState(true);

  const loadProfile = () => {
    if (typeof window !== 'undefined') {
      const savedPremium = localStorage.getItem('is_premium_user');
      if (savedPremium !== null) {
        setIsPremium(savedPremium === 'true');
      }

      const savedProfile = localStorage.getItem('user_profile_data');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setUsername(parsed.username || 'KR Listener');
        setEmail(parsed.email || 'listener@kr-music.com');
        setBio(parsed.bio || '');
        setAvatar(parsed.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300');
      }

      const history = localStorage.getItem('playbackHistory');
      const parsedHistory = history ? JSON.parse(history) : [];
      
      const playlists = localStorage.getItem('customPlaylists');
      const parsedPlaylists = playlists ? JSON.parse(playlists) : [];

      setStats({
        playedCount: parsedHistory.length || 0,
        playlistsCount: parsedPlaylists.length || 0,
        likedCount: player.likedSongs.length || 0,
      });
    }
  };

  useEffect(() => {
    loadProfile();
  }, [player.likedSongs]);

  const handleEditClick = () => {
    setEditUsername(username);
    setEditEmail(email);
    setEditBio(bio);
    setEditAvatar(avatar);
    setIsEditOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      username: editUsername.trim(),
      email: editEmail.trim(),
      bio: editBio.trim(),
      avatar: editAvatar.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
    };

    localStorage.setItem('user_profile_data', JSON.stringify(updated));
    setUsername(updated.username);
    setEmail(updated.email);
    setBio(updated.bio);
    setAvatar(updated.avatar);
    setIsEditOpen(false);
  };

  const handlePlaySong = (song: any) => {
    const formatted = {
      ...song,
      artist: typeof song.artist === 'string' ? { id: 'a5', name: song.artist } : song.artist || { id: 'a5', name: 'Unknown' },
      album: song.album || null
    };
    dispatch(setSong(formatted));
  };

  return (
    <div className="p-8 pb-32 space-y-8 text-brandWhite select-none animate-fade-in relative min-h-full">
      
      {/* Back to Home Navigation */}
      <Link
        href="/"
        className="flex items-center gap-2 text-brandMuted hover:text-[#FFFFFF] text-xs font-extrabold uppercase tracking-widest transition-colors mb-4 w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      {/* 1. Profile Banner */}
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-end bg-gradient-to-b from-[#1E3264]/40 to-[#121212] p-8 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-5 text-spotifyGreen pointer-events-none transform translate-x-12 -translate-y-12">
          <User className="w-64 h-64" />
        </div>

        {/* Avatar Container */}
        <div className="relative group w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 z-10">
          <img
            src={avatar}
            alt={username}
            className="w-full h-full object-cover"
          />
          <div 
            onClick={handleEditClick}
            className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
          >
            <Edit className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Profile Meta Details */}
        <div className="space-y-4 z-10 flex-grow text-center md:text-left">
          <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-white bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Profile Account
            </span>
            <span className={`text-[10px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-full border ${
              isPremium 
                ? 'bg-spotifyGreen/15 text-spotifyGreen border-spotifyGreen/30' 
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}>
              {isPremium ? '★ Premium Member' : 'Free Tier'}
            </span>
          </div>
          
          <div className="space-y-1.5">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">{username}</h1>
            <p className="text-xs text-brandMuted">{email}</p>
          </div>

          <p className="text-xs text-brandMuted max-w-lg leading-relaxed">
            {bio || 'Add a bio to tell the community about your musical palette.'}
          </p>

          <button
            onClick={handleEditClick}
            className="px-5 py-2 bg-[#282828] hover:bg-[#323232] border border-white/5 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 mx-auto md:mx-0"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Subscription Status Card */}
      <div className="bg-[#181818] border border-white/5 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isPremium ? 'bg-spotifyGreen/20 text-spotifyGreen' : 'bg-amber-500/20 text-amber-400'}`}>
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">Subscription Plan: <span className={isPremium ? 'text-spotifyGreen' : 'text-amber-400'}>{isPremium ? 'KR Music Premium Active' : 'Free Account'}</span></h3>
            <p className="text-xs text-brandMuted mt-0.5">{isPremium ? 'You have active Premium access with high-fidelity audio streams and offline downloads.' : 'Free tier account.'}</p>
          </div>
        </div>
        <button
          onClick={() => {
            const nextState = !isPremium;
            setIsPremium(nextState);
            localStorage.setItem('is_premium_user', String(nextState));
          }}
          className="px-4 py-2 text-xs font-bold rounded-full border border-white/10 hover:bg-white/10 transition-all text-white flex-shrink-0"
        >
          {isPremium ? 'Switch to Free' : 'Upgrade to Premium'}
        </button>
      </div>

      {/* 2. User Stats blocks */}
      <div className="grid grid-cols-3 gap-6 max-w-3xl">
        {[
          { label: 'Songs Played', value: stats.playedCount, icon: Play },
          { label: 'Playlists Created', value: stats.playlistsCount, icon: Disc },
          { label: 'Liked Tracks', value: stats.likedCount, icon: Heart }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-[#181818] border border-white/5 p-5 rounded-2xl flex flex-col gap-2 shadow-lg items-center text-center justify-center hover:border-spotifyGreen/20 transition-colors"
            >
              <div className="p-2.5 bg-white/5 rounded-xl text-brandMuted">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-[10px] text-brandMuted uppercase tracking-wider font-semibold mt-0.5">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Top Liked Music Snippets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        
        {/* Liked list */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Your Favorite Tracks</h2>
          <div className="bg-[#181818] border border-white/5 rounded-2xl p-4 shadow-xl space-y-3">
            {player.likedSongs.slice(0, 4).map((song) => (
              <div
                key={song.id}
                onClick={() => handlePlaySong(song)}
                className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-[#282828]/50 transition-colors cursor-pointer group"
              >
                <img
                  src={song.coverImage}
                  alt=""
                  className="w-11 h-11 rounded-lg object-cover border border-white/5 flex-shrink-0"
                />
                <div className="truncate flex-grow">
                  <h4 className="text-sm font-bold text-white group-hover:text-spotifyGreen transition-colors truncate">
                    {song.name}
                  </h4>
                  <p className="text-xs text-brandMuted truncate">{song.artist.name}</p>
                </div>
                <button className="w-8 h-8 rounded-full bg-spotifyGreen text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-4.5 h-4.5 fill-black text-black ml-0.5" />
                </button>
              </div>
            ))}
            {player.likedSongs.length === 0 && (
              <p className="text-xs text-brandMuted italic py-4 text-center">No liked songs yet.</p>
            )}
          </div>
        </div>

        {/* Recently Played */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Top Recently Listened</h2>
          <div className="bg-[#181818] border border-white/5 rounded-2xl p-4 shadow-xl space-y-3">
            {(player.history && player.history.length > 0 ? player.history.slice(0, 4) : []).map((song) => (
              <div
                key={song.id}
                onClick={() => handlePlaySong(song)}
                className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-[#282828]/50 transition-colors cursor-pointer group"
              >
                <img
                  src={song.coverImage}
                  alt=""
                  className="w-11 h-11 rounded-lg object-cover border border-white/5 flex-shrink-0"
                />
                <div className="truncate flex-grow">
                  <h4 className="text-sm font-bold text-white group-hover:text-spotifyGreen transition-colors truncate">
                    {song.name}
                  </h4>
                  <p className="text-xs text-brandMuted truncate">{song.artist.name}</p>
                </div>
                <button className="w-8 h-8 rounded-full bg-spotifyGreen text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-4.5 h-4.5 fill-black text-black ml-0.5" />
                </button>
              </div>
            ))}
            {(!player.history || player.history.length === 0) && (
              <p className="text-xs text-brandMuted italic py-4 text-center">No listening history recorded yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* 4. Edit Profile Modal Dialog */}
      {isEditOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center px-4 bg-black/85 backdrop-blur-xs select-none">
          <form 
            onSubmit={handleSaveProfile}
            className="w-full max-w-md bg-[#181818] border border-white/5 p-6 rounded-2xl shadow-2xl space-y-5"
          >
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-lg font-black text-white">Edit Profile Details</h3>
              <p className="text-xs text-brandMuted">Customize how you appear to others on KR Music.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-brandMuted uppercase tracking-wider block">Username</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#121212] border border-white/5 focus:border-spotifyGreen text-xs rounded-xl focus:outline-none text-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-brandMuted uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#121212] border border-white/5 focus:border-spotifyGreen text-xs rounded-xl focus:outline-none text-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-brandMuted uppercase tracking-wider block">Avatar URL</label>
                <input
                  type="url"
                  placeholder="Paste direct portrait URL"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#121212] border border-white/5 focus:border-spotifyGreen text-xs rounded-xl focus:outline-none text-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-brandMuted uppercase tracking-wider block">Biography</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#121212] border border-white/5 focus:border-spotifyGreen text-xs rounded-xl focus:outline-none text-white transition-colors resize-none"
                  placeholder="Brief story about yourself"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 bg-transparent hover:bg-white/5 text-xs font-bold text-white rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold text-xs rounded-full hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
