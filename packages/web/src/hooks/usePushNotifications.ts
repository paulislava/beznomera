'use client';

import { useCallback, useEffect, useState } from 'react';
import { notificationService } from '@/services';

const PUSH_SESSION_KEY = 'push_notifications_init';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

async function subscribeAfterPermission() {
  const registration = await navigator.serviceWorker.register('/service-worker.js');
  await navigator.serviceWorker.ready;

  const { publicKey } = await notificationService.vapidPublicKey();
  const applicationServerKey = urlBase64ToUint8Array(publicKey);

  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    }));

  const { endpoint, keys } = subscription.toJSON() as {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  };

  await notificationService.subscribe({ endpoint, keys });
}

export function usePushNotifications() {
  const [showBanner, setShowBanner] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported' | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !('Notification' in window)
    ) {
      setPermission('unsupported');
      return;
    }

    setPermission(Notification.permission);

    if (sessionStorage.getItem(PUSH_SESSION_KEY)) return;

    if (Notification.permission === 'granted') {
      sessionStorage.setItem(PUSH_SESSION_KEY, '1');
      subscribeAfterPermission().catch(() => {});
      return;
    }

    if (Notification.permission === 'denied') {
      sessionStorage.setItem(PUSH_SESSION_KEY, '1');
      return;
    }

    setShowBanner(true);
  }, []);

  const onEnable = useCallback(async () => {
    sessionStorage.setItem(PUSH_SESSION_KEY, '1');
    setShowBanner(false);

    const result = await Notification.requestPermission();
    setPermission(result);
    if (result !== 'granted') return;

    await subscribeAfterPermission();
  }, []);

  const onDismiss = useCallback(() => {
    sessionStorage.setItem(PUSH_SESSION_KEY, '1');
    setShowBanner(false);
  }, []);

  return { showBanner, permission, onEnable, onDismiss };
}
