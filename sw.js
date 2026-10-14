// UPDATE: Poin 2 - Definisi Cache dan Daftar URL CDN untuk PWA
const CACHE_NAME = 'tapak-pwa-cache-v2';

const urlsToCache = [
  './',
  './index.html', // Pastikan nama file HTML Anda cocok
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Hapus cache versi lama jika ada update
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Abaikan metode POST (pengiriman absen ke server)
  if (event.request.method !== 'GET') return; 
  
  // Jangan pernah melakukan cache pada endpoint API Google Script (karena dinamis)
  if (event.request.url.includes('script.google.com')) return; 

  // The Proxy: Cegat CDN dan HTML, berikan dari memori lokal HP (Cache) jika ada
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request).catch(() => {
            console.warn('Offline Mode: Intercepted failed fetch for', event.request.url);
        });
      })
  );
});
