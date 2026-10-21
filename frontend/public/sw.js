self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => new Response(null, {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Cache-Control': 'no-store' },
    }))
  );
});
