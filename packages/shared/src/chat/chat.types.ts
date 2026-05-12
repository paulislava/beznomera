export enum MessageSource {
  Sender = 'sender',
  Reciever = 'reciever'
}

export interface ChatMessageInfo {
  id: number;
  chatId: number;
  text: string;
  userId: number | null;
  createdAt: string;
  source: MessageSource;
  attachmentUrl?: string | null;
}

export interface ChatInfo {
  id: number;
  createdAt: string;
  lastMessage?: ChatMessageInfo;
  senderName?: string;
  contactType?: string | null;
  contactValue?: string | null;
  car?: {
    id: number;
    no: string;
    code: string;
  };
}

export interface ChatDetails {
  id: number;
  createdAt: string;
  messages: ChatMessageInfo[];
  senderName?: string;
  contactType?: string | null;
  contactValue?: string | null;
  car?: {
    id: number;
    no: string;
    code: string;
  };
}

export interface ChatSendMessageBody {
  chatId: number;
  text: string;
  attachmentUrl?: string;
}

export interface ChatContactBody {
  contactType: string;
  contactValue?: string;
}

export const CHAT_EVENTS = {
  JOIN_CHAT: 'chat:join',
  LEAVE_CHAT: 'chat:leave',
  SEND_MESSAGE: 'chat:send_message',
  NEW_MESSAGE: 'chat:new_message',
  ERROR: 'chat:error',
} as const;
