export interface LocationInfo {
  latitude: number;
  longitude: number;
}

export interface ChatMessageData {
  coords?: LocationInfo;
  text: string;
}

export interface TelegramUser {
  id: number;
}
