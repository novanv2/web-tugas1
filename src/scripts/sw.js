import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';

// Precache seluruh aset hasil build
precacheAndRoute(self.__WB_MANIFEST);

// Push Notification
self.addEventListener('push', function (event) {
  if (!event.data) {
    console.warn('[Service Worker] Push event tanpa data');
    return;
  }

  let payload = {};
  try {
    payload = event.data.json();
  } catch (e) {
    console.error('[Service Worker] Payload bukan JSON:', e);
  }

  const title = payload.title || 'Notifikasi';
  const options = payload.options || {
    body: 'Ada notifikasi baru.',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// API caching
registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev' &&
               !url.pathname.includes('/images/'),
  new NetworkFirst({
    cacheName: 'dicoding-api',
  })
);

// Gambar dari endpoint /images/stories/*.jpg|png
registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev' &&
               /\.(png|jpg|jpeg|webp|svg|blob)$/.test(url.pathname),
  new StaleWhileRevalidate({
    cacheName: 'dicoding-api-images',
  })
);

// Tile map OSM (jika digunakan)
registerRoute(
  ({ url }) => url.origin.includes('tile.openstreetmap.org'),
  new StaleWhileRevalidate({
    cacheName: 'osm-tiles',
  })
);