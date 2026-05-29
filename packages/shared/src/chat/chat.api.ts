import { APIRoutes, apiInfo } from '../api-routes';
import {
  ChatContactBody,
  ChatDetails,
  ChatInfo,
  ChatMessageInfo,
  ChatSendMessageBody,
} from './chat.types';

export interface ChatApi {
  myChats(...args: any[]): Promise<ChatInfo[]>;
  myChatsForUser(userId: number, ...args: any[]): Promise<ChatInfo[]>;
  chatDetails(chatId: number, ...args: any[]): Promise<ChatDetails>;
  chatDetailsForUser(chatId: number, userId: number, ...args: any[]): Promise<ChatDetails>;
  chatByCarCode(code: string, ...args: any[]): Promise<ChatDetails>;
  sendOwnerMessage(body: ChatSendMessageBody, chatId: number, ...args: any[]): Promise<ChatMessageInfo>;
  updateContact(body: ChatContactBody, chatId: number, ...args: any[]): Promise<void>;
  markAsRead(body: Record<string, never>, chatId: number, ...args: any[]): Promise<void>;
  deleteChat(body: Record<string, never>, chatId: number, ...args: any[]): Promise<void>;
  deleteMessage(body: Record<string, never>, chatId: number, messageId: number, ...args: any[]): Promise<void>;
}

export const CHAT_ID_PARAM = 'chatId';
export const CHAT_CODE_PARAM = 'code';
export const CHAT_MESSAGE_ID_PARAM = 'messageId';
export const CHAT_USER_ID_PARAM = 'userId';

const CHAT_ROUTES: APIRoutes<ChatApi> = {
  myChats: 'my',
  myChatsForUser: (userId) => `my/user/${userId || `:${CHAT_USER_ID_PARAM}`}`,
  chatDetails: (chatId) => `${chatId || `:${CHAT_ID_PARAM}`}`,
  chatDetailsForUser: (chatId, userId) => `${chatId || `:${CHAT_ID_PARAM}`}/user/${userId || `:${CHAT_USER_ID_PARAM}`}`,
  chatByCarCode: (code) => `by-car/${code || `:${CHAT_CODE_PARAM}`}`,
  sendOwnerMessage: {
    path: (chatId) => `${chatId || `:${CHAT_ID_PARAM}`}/message`,
    method: 'POST',
  },
  updateContact: {
    path: (chatId) => `${chatId || `:${CHAT_ID_PARAM}`}/contact`,
    method: 'POST',
  },
  markAsRead: {
    path: (chatId) => `${chatId || `:${CHAT_ID_PARAM}`}/read`,
    method: 'POST',
  },
  deleteChat: {
    path: (chatId) => `${chatId || `:${CHAT_ID_PARAM}`}`,
    method: 'DELETE',
  },
  deleteMessage: {
    path: (chatId, messageId) =>
      `${chatId || `:${CHAT_ID_PARAM}`}/message/${messageId || `:${CHAT_MESSAGE_ID_PARAM}`}`,
    method: 'DELETE',
  },
};

const CHAT_API = apiInfo(CHAT_ROUTES, 'chat');
export default CHAT_API;
