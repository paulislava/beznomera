import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { parse as parseCookies } from 'cookie';

import { ChatService } from './chat.service';
import { ConfigService } from '../config/config.service';
import {
  CHAT_EVENTS,
  ChatInfo,
  ChatMessageInfo,
} from '@paulislava/shared/chat/chat.types';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*', credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    const rawCookie = client.handshake.headers?.cookie ?? '';
    const parsed = rawCookie ? parseCookies(rawCookie) : {};

    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.['x-user-token'] ||
      parsed[this.configService.auth.jwtCookie];

    if (token) {
      try {
        const payload = this.jwtService.verify(token, {
          secret: this.configService.auth.jwtSecret,
        });
        client.data.userId = payload.userId;
        client.join(`user:${payload.userId}`);
      } catch {
        // anonymous
      }
    }

    client.data.anonymousId = parsed[this.configService.auth.anonymousIdCookie];
  }

  handleDisconnect(_client: Socket) {}

  @SubscribeMessage(CHAT_EVENTS.JOIN_CHAT)
  handleJoinChat(client: Socket, chatId: number) {
    client.join(`chat:${chatId}`);
  }

  @SubscribeMessage(CHAT_EVENTS.LEAVE_CHAT)
  handleLeaveChat(client: Socket, chatId: number) {
    client.leave(`chat:${chatId}`);
  }

  @SubscribeMessage(CHAT_EVENTS.SEND_MESSAGE)
  async handleSendMessage(
    client: Socket,
    payload: { chatId: number; text: string; attachmentUrl?: string },
  ) {
    const { chatId, text, attachmentUrl } = payload;
    const userId = client.data.userId as number | undefined;
    const anonymousId = client.data.anonymousId as string | undefined;

    try {
      const { message, ownerUserId, chatInfo } =
        await this.chatService.handleWebSocketMessage(
          chatId,
          text,
          attachmentUrl,
          userId,
          anonymousId,
        );
      this.server.to(`chat:${chatId}`).emit(CHAT_EVENTS.NEW_MESSAGE, message);
      if (ownerUserId) {
        this.server
          .to(`user:${ownerUserId}`)
          .emit(CHAT_EVENTS.CHAT_UPDATE, chatInfo);
      }
    } catch (err: any) {
      client.emit(CHAT_EVENTS.ERROR, err?.message ?? 'Error');
    }
  }

  @SubscribeMessage(CHAT_EVENTS.TYPING)
  handleTyping(client: Socket, payload: { chatId: number; isTyping: boolean }) {
    client
      .to(`chat:${payload.chatId}`)
      .emit(CHAT_EVENTS.TYPING, {
        chatId: payload.chatId,
        isTyping: payload.isTyping,
      });
  }

  @SubscribeMessage(CHAT_EVENTS.MARK_READ)
  async handleMarkRead(client: Socket, payload: { chatId: number }) {
    const userId = client.data.userId as number | undefined;
    if (!userId) return;

    try {
      const chatInfo = await this.chatService.markAsRead(
        payload.chatId,
        userId,
      );
      this.server.to(`user:${userId}`).emit(CHAT_EVENTS.CHAT_UPDATE, chatInfo);
    } catch {
      // ignore
    }
  }

  @SubscribeMessage(CHAT_EVENTS.DELETE_MESSAGE)
  async handleDeleteMessage(
    client: Socket,
    payload: { messageId: number; chatId: number },
  ) {
    const userId = client.data.userId as number | undefined;
    const anonymousId = client.data.anonymousId as string | undefined;

    try {
      const result = await this.chatService.deleteMessage(
        payload.messageId,
        userId,
        anonymousId,
      );
      this.server
        .to(`chat:${payload.chatId}`)
        .emit(CHAT_EVENTS.MESSAGE_DELETED, result);
    } catch (err: any) {
      client.emit(CHAT_EVENTS.ERROR, err?.message ?? 'Error');
    }
  }

  @SubscribeMessage(CHAT_EVENTS.DELETE_CHAT)
  async handleDeleteChat(client: Socket, payload: { chatId: number }) {
    const userId = client.data.userId as number | undefined;
    if (!userId) return;

    try {
      const ownerId = await this.chatService.deleteChat(payload.chatId, userId);
      this.server
        .to(`chat:${payload.chatId}`)
        .emit(CHAT_EVENTS.CHAT_DELETED, { chatId: payload.chatId });
      this.server
        .to(`user:${ownerId}`)
        .emit(CHAT_EVENTS.CHAT_DELETED, { chatId: payload.chatId });
    } catch (err: any) {
      client.emit(CHAT_EVENTS.ERROR, err?.message ?? 'Error');
    }
  }

  emitNewMessage(chatId: number, message: ChatMessageInfo) {
    this.server.to(`chat:${chatId}`).emit(CHAT_EVENTS.NEW_MESSAGE, message);
  }

  emitChatUpdate(ownerUserId: number, chatInfo: ChatInfo) {
    this.server
      .to(`user:${ownerUserId}`)
      .emit(CHAT_EVENTS.CHAT_UPDATE, chatInfo);
  }
}
