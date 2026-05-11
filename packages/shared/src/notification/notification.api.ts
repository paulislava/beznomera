import { APIRoutes, apiInfo } from '../api-routes';
import { PushSubscribeBody, PushUnsubscribeBody } from './notification.types';

export interface NotificationApi {
  vapidPublicKey(...args: any[]): Promise<{ publicKey: string }>;
  subscribe(body: PushSubscribeBody, ...args: any[]): Promise<void>;
  unsubscribe(body: PushUnsubscribeBody, ...args: any[]): Promise<void>;
}

const NOTIFICATION_ROUTES: APIRoutes<NotificationApi> = {
  vapidPublicKey: 'vapid-public-key',
  subscribe: {
    path: 'subscribe',
    method: 'POST',
  },
  unsubscribe: {
    path: 'unsubscribe',
    method: 'POST',
  },
};

const NOTIFICATION_API = apiInfo(NOTIFICATION_ROUTES, 'notifications');
export default NOTIFICATION_API;
