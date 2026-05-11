'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/Auth/Auth.context';
import { usePushNotifications } from '@/hooks/usePushNotifications';

function PushNotificationsSubscriber() {
  usePushNotifications();
  return null;
}

export function NotificationsInit() {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return <PushNotificationsSubscriber />;
}
