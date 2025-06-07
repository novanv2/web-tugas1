self.addEventListener('push', function(event) {
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

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
