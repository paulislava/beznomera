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
  chatDetails(chatId: number, ...args: any[]): Promise<ChatDetails>;
  chatByCarCode(code: string, ...args: any[]): Promise<ChatDetails>;
  sendOwnerMessage(body: ChatSendMessageBody, chatId: number, ...args: any[]): Promise<ChatMessageInfo>;
  updateContact(body: ChatContactBody, chatId: number, ...args: any[]): Promise<void>;
}

export const CHAT_ID_PARAM = 'chatId';
export const CHAT_CODE_PARAM = 'code';

const CHAT_ROUTES: APIRoutes<ChatApi> = {
  myChats: 'my',
  chatDetails: (chatId) => `${chatId || `:${CHAT_ID_PARAM}`}`,
  chatByCarCode: (code) => `by-car/${code || `:${CHAT_CODE_PARAM}`}`,
  sendOwnerMessage: {
    path: (chatId) => `${chatId || `:${CHAT_ID_PARAM}`}/message`,
    method: 'POST',
  },
  updateContact: {
    path: (chatId) => `${chatId || `:${CHAT_ID_PARAM}`}/contact`,
    method: 'POST',
  },
};

const CHAT_API = apiInfo(CHAT_ROUTES, 'chat');
export default CHAT_API;
