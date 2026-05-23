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
