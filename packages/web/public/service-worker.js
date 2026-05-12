self.addEventListener('push', function (event) {
  if (!event.data) return;

  const payload = event.data.json();
  const { type, carId, carCode, title, body } = payload;

  const actions =
    type === 'message'
      ? [{ action: 'reply', title: 'Ответить' }]
      : [{ action: 'open', title: 'Открыть' }];

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/logo-for-qr-light.png',
      badge: '/logo-for-qr-light.png',
      data: { type, carId, carCode },
      actions,
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const { type, carId, carCode } = event.notification.data || {};
  const url =
    type === 'message' && carCode
      ? `/g/${carCode}/chat`
      : type === 'call' && carId
        ? `/car/${carId}`
        : '/panel';

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
