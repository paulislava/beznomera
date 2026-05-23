export interface PushSubscribeBody {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushUnsubscribeBody {
  endpoint: string;
}

export type CarNotificationType = 'message' | 'rating' | 'call';
export type NotificationType = CarNotificationType | 'chat';

export interface CarNotificationEvent {
  type: CarNotificationType;
  carId: number;
  carCode: string;
  carNo: string;
  title: string;
  body: string;
}

export interface ChatNotificationEvent {
  chatId: number;
  ownerUserId: number;
  senderName: string;
  body: string;
}

export interface PushPayload {
  type: NotificationType;
  carId?: number;
  carCode?: string;
  chatId?: number;
  title: string;
  body: string;
}
