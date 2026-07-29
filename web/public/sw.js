self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // A simple fetch handler to satisfy Chrome's PWA install requirements.
  // We just let the browser handle the request normally.
  e.respondWith(fetch(e.request).catch(() => new Response("Offline")));
});
