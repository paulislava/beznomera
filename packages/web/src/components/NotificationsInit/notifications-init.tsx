'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/Auth/Auth.context';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { NotificationBanner } from './notification-banner';

function PushNotificationsSubscriber() {
  const { showBanner, onEnable, onDismiss } = usePushNotifications();

  if (!showBanner) return null;

  return <NotificationBanner onEnable={onEnable} onDismiss={onDismiss} />;
}

export function NotificationsInit() {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return <PushNotificationsSubscriber />;
}
