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

export interface CarNotificationEvent {
  type: CarNotificationType;
  carId: number;
  carCode: string;
  carNo: string;
  title: string;
  body: string;
}

export interface PushPayload {
  type: CarNotificationType;
  carCode: string;
  title: string;
  body: string;
}
