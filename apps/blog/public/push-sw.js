self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? '博客新回复', {
      body: data.body ?? '',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: data.tag,
      data: { url: data.url ?? '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const target = event.notification.data.url;
        const current = clients.find((client) => client.url === target);
        return current ? current.focus() : self.clients.openWindow(target);
      }),
  );
});
