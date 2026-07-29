'use client';

import { useState } from 'react';
import { ShieldCheck, BarChart3, Users, Play, Upload, Trash2, Plus, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  // Mock metrics
  const [stats, setStats] = useState({
    dau: 1540,
    totalStreams: 45290,
    activeSubscriptions: 890,
    revenue: 8890.10,
  });

  // Track uploader form
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [duration, setDuration] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [usersList, setUsersList] = useState([
    { id: 'u1', email: 'normal_user@gmail.com', username: 'MusicLover', role: 'USER', plan: 'PREMIUM_INDIVIDUAL' },
    { id: 'u2', email: 'dj_alex@krmusic.com', username: 'AlexGreen', role: 'ARTIST', plan: 'FREE' },
    { id: 'u3', email: 'admin@krmusic.com', username: 'AdminController', role: 'ADMIN', plan: 'PREMIUM_INDIVIDUAL' },
  ]);

  const handleUploadSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songName || !artistName || !audioUrl) return;

    setSuccessMsg(`"${songName}" uploaded and indexed in database!`);
    // Clear inputs
    setSongName('');
    setArtistName('');
    setDuration('');
    setCoverUrl('');
    setAudioUrl('');
    setLyrics('');

    // Remove success popup in 4s
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDeleteUser = (id: string) => {
    setUsersList(usersList.filter(u => u.id !== id));
  };

  return (
    <div className="p-8 pb-32 space-y-8 select-none text-brandWhite">
      {/* Page Header */}
      <header className="flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-brandNeon" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Administration</h1>
          <p className="text-xs text-brandMuted">Platform metrics, uploader catalogs, and subscriber logs</p>
        </div>
      </header>

      {/* Analytics widgets row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-brandDarkGray border border-brandHighlight p-6 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-brandMuted">
            <span className="text-xs font-bold uppercase tracking-wider">Daily Listeners</span>
            <Users className="w-4 h-4 text-brandNeon" />
          </div>
          <p className="text-2xl font-extrabold">{stats.dau.toLocaleString()}</p>
          <span className="text-[10px] text-green-500 font-semibold">+12% vs last week</span>
        </div>

        <div className="bg-brandDarkGray border border-brandHighlight p-6 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-brandMuted">
            <span className="text-xs font-bold uppercase tracking-wider">Total Streams</span>
            <Play className="w-4 h-4 text-brandNeon" />
          </div>
          <p className="text-2xl font-extrabold">{stats.totalStreams.toLocaleString()}</p>
          <span className="text-[10px] text-green-500 font-semibold">+5% play-through index</span>
        </div>

        <div className="bg-brandDarkGray border border-brandHighlight p-6 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-brandMuted">
            <span className="text-xs font-bold uppercase tracking-wider">Premium Subs</span>
            <Users className="w-4 h-4 text-brandNeon" />
          </div>
          <p className="text-2xl font-extrabold">{stats.activeSubscriptions.toLocaleString()}</p>
          <span className="text-[10px] text-brandNeon font-semibold">58% conversion rate</span>
        </div>

        <div className="bg-brandDarkGray border border-brandHighlight p-6 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-brandMuted">
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Revenue</span>
            <BarChart3 className="w-4 h-4 text-brandNeon" />
          </div>
          <p className="text-2xl font-extrabold">${stats.revenue.toLocaleString()}</p>
          <span className="text-[10px] text-brandNeon font-semibold">Stripe Live Webhook connected</span>
        </div>
      </section>

      {/* Main dashboard splits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Column 1: Music Upload form */}
        <section className="bg-brandDarkGray border border-brandHighlight p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Upload className="w-5 h-5 text-brandNeon" />
            Upload Song Metadata
          </h2>
          
          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-brandNeon/10 border border-brandNeon/30 text-brandNeon rounded-lg text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleUploadSong} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Song Title"
                value={songName}
                onChange={e => setSongName(e.target.value)}
                className="bg-brandElevated border border-brandHighlight/40 focus:border-brandNeon rounded-lg p-2.5 text-xs outline-none"
                required
              />
              <input
                type="text"
                placeholder="Artist Name / ID"
                value={artistName}
                onChange={e => setArtistName(e.target.value)}
                className="bg-brandElevated border border-brandHighlight/40 focus:border-brandNeon rounded-lg p-2.5 text-xs outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Duration (seconds)"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="bg-brandElevated border border-brandHighlight/40 focus:border-brandNeon rounded-lg p-2.5 text-xs outline-none"
              />
              <input
                type="text"
                placeholder="Cover Artwork S3 URL"
                value={coverUrl}
                onChange={e => setCoverUrl(e.target.value)}
                className="bg-brandElevated border border-brandHighlight/40 focus:border-brandNeon rounded-lg p-2.5 text-xs outline-none"
              />
            </div>
            <input
              type="text"
              placeholder="Audio CDN URL (AWS CloudFront)"
              value={audioUrl}
              onChange={e => setAudioUrl(e.target.value)}
              className="w-full bg-brandElevated border border-brandHighlight/40 focus:border-brandNeon rounded-lg p-2.5 text-xs outline-none"
              required
            />
            <textarea
              placeholder="Lyrics text..."
              value={lyrics}
              onChange={e => setLyrics(e.target.value)}
              rows={3}
              className="w-full bg-brandElevated border border-brandHighlight/40 focus:border-brandNeon rounded-lg p-2.5 text-xs outline-none resize-none"
            />
            <button
              type="submit"
              className="w-full bg-brandNeon hover:brightness-110 text-brandBg font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 text-brandBg" />
              Add Song to Catalog
            </button>
          </form>
        </section>

        {/* Column 2: Manage Users table */}
        <section className="bg-brandDarkGray border border-brandHighlight p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-brandNeon" />
            Manage Users
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brandElevated text-brandMuted uppercase tracking-wider font-bold">
                  <th className="pb-3 pr-2">Username</th>
                  <th className="pb-3 pr-2">Role</th>
                  <th className="pb-3 pr-2">Plan</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((user) => (
                  <tr key={user.id} className="border-b border-brandElevated/40 hover:bg-brandElevated/30 transition-colors">
                    <td className="py-3 pr-2 font-medium">
                      <p>{user.username}</p>
                      <p className="text-[10px] text-brandMuted font-light">{user.email}</p>
                    </td>
                    <td className="py-3 pr-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500' :
                        user.role === 'ARTIST' ? 'bg-brandNeon/15 text-brandNeon' : 'bg-brandWhite/10 text-brandWhite'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-brandMuted font-medium">{user.plan.replace('_', ' ')}</td>
                    <td className="py-3 text-right">
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 text-brandMuted hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
