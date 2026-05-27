const LOST_CACHE = 'lost-api-v1';

self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;
  if (!url.pathname.startsWith('/api/lost/')) return;

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        const clone = response.clone();
        caches.open(LOST_CACHE).then(function (cache) {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(function () {
        return caches.match(event.request);
      }),
  );
});

self.addEventListener('push', function (event) {
  if (!event.data) return;

  const payload = event.data.json();
  const { type, carId, carCode, chatId, title, body } = payload;

  const actions =
    type === 'message' || type === 'chat'
      ? [{ action: 'reply', title: 'Ответить' }]
      : [{ action: 'open', title: 'Открыть' }];

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/logo-for-qr-light.png',
      badge: '/logo-for-qr-light.png',
      data: { type, carId, carCode, chatId },
      actions,
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const { type, carId, carCode, chatId } = event.notification.data || {};
  const url =
    type === 'chat' && chatId
      ? `/messages/${chatId}`
      : type === 'message' && carCode
        ? `/g/${carCode}/chat`
        : type === 'call' && carId
          ? `/car/${carId}`
          : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      const existing = list.find(function (c) {
        return c.url.includes(url);
      });
      if (existing) {
        return existing.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
