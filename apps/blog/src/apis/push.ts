import { apiFetch, apiJson } from './client';

let subscribing: Promise<boolean> | null = null;

function decodeKey(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const bytes = atob((value + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bytes, (character) => character.charCodeAt(0));
}

async function subscribe() {
  if (
    !('serviceWorker' in navigator) ||
    !('PushManager' in window) ||
    !('Notification' in window)
  ) {
    return false;
  }

  let permission = Notification.permission;
  if (permission === 'default')
    permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  const registration = await navigator.serviceWorker.register('/push-sw.js');
  const { public_key: publicKey } = await apiJson<{ public_key: string }>(
    '/api/push/public-key',
  );
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeKey(publicKey),
    }));
  const response = await apiFetch('/api/push/subscriptions', {
    method: 'POST',
    body: JSON.stringify(subscription.toJSON()),
  });
  if (!response.ok) throw new Error('通知订阅失败');
  return true;
}

export const PushApi = {
  ensureSubscribed: () => {
    subscribing ??= subscribe()
      .catch(() => false)
      .finally(() => {
        subscribing = null;
      });
    return subscribing;
  },
};
