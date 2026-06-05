const CACHE_NAME = 'money-saver-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First for HTML documents, Cache-First for static assets
self.addEventListener('fetch', (e) => {
  // Only handle GET requests (prevents crash on POST/PUT/DELETE API requests in Safari/iOS)
  if (e.request.method !== 'GET') {
    return;
  }

  const url = new URL(e.request.url);

  // For navigate requests (HTML pages) or index.html, use Network-First with Cache Fallback
  if (e.request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          if (response.status === 200) {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseCopy);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(e.request) || caches.match('/');
        })
    );
    return;
  }

  // For static assets, try Cache first, then Network and Cache it dynamically
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(e.request).then((response) => {
        // Cache dynamic assets that are JS, CSS, or images from local origin
        const isStaticAsset = url.origin === self.location.origin && (
          url.pathname.startsWith('/assets/') ||
          url.pathname.endsWith('.js') ||
          url.pathname.endsWith('.css') ||
          url.pathname.endsWith('.png') ||
          url.pathname.endsWith('.svg') ||
          url.pathname.endsWith('.ico')
        );

        if (response.status === 200 && isStaticAsset) {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseCopy);
          });
        }
        return response;
      });
    })
  );
});

// Listen for message from main thread to skip waiting and activate immediately
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Listen for push events
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || 'Money Saver';
    const options = {
      body: payload.body || 'Bạn có thông báo mới.',
      icon: payload.icon || '/icons/icon-192.png',
      badge: payload.badge || '/favicon.svg',
      data: payload.data || {},
      vibrate: [100, 50, 100],
      tag: payload.tag || 'money-saver-notification',
      renotify: true
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (err) {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('Money Saver', {
        body: text,
        icon: '/icons/icon-192.png',
        badge: '/favicon.svg'
      })
    );
  }
});

// Listen for notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = new URL('/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

