'use client';

import { useState, useEffect } from 'react';

// Simple in-memory cache — module level so it's shared across all components
let cache: any[] | null = null;
let fetchPromise: Promise<any[]> | null = null;

export async function fetchPublicPlaylistsData(): Promise<any[]> {
  // Return from cache immediately if available
  if (cache && cache.length > 0) return cache;
  // Reuse in-flight promise if already fetching
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch('/api/playlists/public', {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data: any[] = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Empty playlist response');
      }
      cache = data;
      fetchPromise = null;

      // Sync to localStorage for Sidebar compatibility
      try {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('customPlaylists');
          const existing: any[] = saved ? JSON.parse(saved) : [];
          for (const pub of data) {
            const mapped = {
              id: pub.id,
              name: pub.name,
              description: pub.description,
              coverImage: pub.coverImage || pub.previewSongs?.[0]?.coverImage || null,
              songCount: pub.songCount,
              songs: pub.previewSongs || [],
            };
            const idx = existing.findIndex((p: any) => String(p.id) === String(pub.id));
            if (idx !== -1) {
              existing[idx] = mapped;
            } else {
              existing.unshift(mapped);
            }
          }
          localStorage.setItem('customPlaylists', JSON.stringify(existing));
          window.dispatchEvent(new Event('playlists-updated'));
        }
      } catch (_) {}

      return data;
    })
    .catch((err) => {
      console.error('[usePublicPlaylists] Failed to fetch:', err.message);
      fetchPromise = null; // Allow retry on next call
      return [];
    });

  return fetchPromise;
}

export function invalidatePlaylistCache() {
  cache = null;
  fetchPromise = null;
}

export function usePublicPlaylists() {
  const [playlists, setPlaylists] = useState<any[]>(cache && cache.length > 0 ? cache : []);
  const [loading, setLoading] = useState(!(cache && cache.length > 0));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If cache is already populated, use it immediately
    if (cache && cache.length > 0) {
      setPlaylists(cache);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchPublicPlaylistsData()
      .then((data) => {
        setPlaylists(data);
        setLoading(false);
        if (data.length === 0) {
          setError('No playlists found. Make sure the backend is running.');
        }
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message);
        console.error('[usePublicPlaylists] Hook error:', err);
      });
  }, []);

  return { playlists, loading, error };
}
