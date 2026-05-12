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
import { CHAT_EVENTS, ChatMessageInfo } from '@paulislava/shared/chat/chat.types';

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
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.['x-user-token'];

    if (token) {
      try {
        const payload = this.jwtService.verify(token, {
          secret: this.configService.auth.jwtSecret,
        });
        client.data.userId = payload.userId;
      } catch {
        // anonymous
      }
    }

    const rawCookie = client.handshake.headers?.cookie ?? '';
    if (rawCookie) {
      const parsed = parseCookies(rawCookie);
      const cookieName = this.configService.auth.anonymousIdCookie;
      client.data.anonymousId = parsed[cookieName];
    }
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
      const message = await this.chatService.handleWebSocketMessage(
        chatId,
        text,
        attachmentUrl,
        userId,
        anonymousId,
      );
      this.server.to(`chat:${chatId}`).emit(CHAT_EVENTS.NEW_MESSAGE, message);
    } catch (err: any) {
      client.emit(CHAT_EVENTS.ERROR, err?.message ?? 'Error');
    }
  }

  emitNewMessage(chatId: number, message: ChatMessageInfo) {
    this.server.to(`chat:${chatId}`).emit(CHAT_EVENTS.NEW_MESSAGE, message);
  }
}
