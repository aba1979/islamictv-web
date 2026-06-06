// Islamic TV — Service Worker
// Handles prayer-time notifications that fire regardless of which tab is active.

const CACHE_VERSION = 'islamictv-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// ── Notification trigger (sent from main page via postMessage) ────────────────
self.addEventListener('message', e => {
  if (!e.data || e.data.type !== 'PRAYER_NOTIF') return;

  const { prayerName, arabicName } = e.data;

  e.waitUntil(
    self.registration.showNotification(`🕌 ${prayerName} — Time to Pray`, {
      body:             `It is time for ${prayerName} (${arabicName}) prayer.\nMay Allah accept it from you.`,
      icon:             'images/mosque_1.jpg',
      badge:            'images/mosque_1.jpg',
      tag:              `salah-${prayerName}`,   // replaces any previous notif for same prayer
      renotify:         true,                    // always fires sound/vibrate even if tag exists
      requireInteraction: true,                  // stays visible until the user dismisses it
      silent:           false,
      vibrate:          [300, 150, 300, 150, 300]
    })
  );
});

// ── Click — bring the app tab into focus (or open it) ────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();

  e.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        for (const client of clients) {
          if (/islamictv-web/.test(client.url) && 'focus' in client) {
            return client.focus();
          }
        }
        // No open tab found — open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow('https://aba1979.github.io/islamictv-web/');
        }
      })
  );
});
