import { Injectable, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, DeepPartial } from 'typeorm';
import { Chat } from '../entities/chat/chat.entity';
import { ChatMessage } from '../entities/chat/message.entity';
import { AnonymousUser } from '../entities/user/anonymous-user.entity';
import { Car } from '../entities/car/car.entity';
import { TelegramService } from '../telegram/telegram.service';
import { ConfigService } from '../config/config.service';
import { Response, Request } from 'express';
import { RequestUser } from '@paulislava/shared/user/user.types';
import userAgentParser from 'useragent';
import { ChatMessageData } from './chat.types';
import {
  ChatContactBody,
  ChatDetails,
  ChatInfo,
  ChatMessageInfo,
  MessageSource,
} from '@paulislava/shared/chat/chat.types';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(ChatMessage)
    private readonly messagesRepository: Repository<ChatMessage>,
    @InjectRepository(AnonymousUser)
    private readonly anonymousUserRepository: Repository<AnonymousUser>,
    private readonly telegramService: TelegramService,
    private readonly configService: ConfigService,
  ) {}

  mapMessageToInfo(msg: ChatMessage, chat: Chat): ChatMessageInfo {
    const source =
      msg.userId != null && msg.userId === chat.reciever?.id
        ? MessageSource.Reciever
        : MessageSource.Sender;

    return {
      id: msg.id,
      chatId: msg.chatId,
      text: msg.text,
      userId: msg.userId,
      createdAt: msg.createdAt.toISOString(),
      source,
      attachmentUrl: msg.attachmentUrl ?? null,
    };
  }

  private mapChatToInfo(chat: Chat, messages: ChatMessage[]): ChatInfo {
    const senderName =
      chat.sender?.name ??
      chat.anonymousSender?.id?.slice(0, 8) ??
      'Анонимный';

    const lastMessage = messages[0]
      ? this.mapMessageToInfo(messages[0], chat)
      : undefined;

    return {
      id: chat.id,
      createdAt: chat.createdAt.toISOString(),
      lastMessage,
      senderName,
      contactType: chat.contactType,
      contactValue: chat.contactValue,
      car: chat.messages?.[0]?.car
        ? {
            id: chat.messages[0].car.id,
            no: chat.messages[0].car.no,
            code: chat.messages[0].car.code,
          }
        : undefined,
    };
  }

  private mapChatToDetails(chat: Chat): ChatDetails {
    const senderName =
      chat.sender?.name ??
      chat.anonymousSender?.id?.slice(0, 8) ??
      'Анонимный';

    const messages = (chat.messages ?? []).map((m) => this.mapMessageToInfo(m, chat));

    const firstMsgCar = chat.messages?.find((m) => m.car)?.car;

    return {
      id: chat.id,
      createdAt: chat.createdAt.toISOString(),
      messages,
      senderName,
      contactType: chat.contactType,
      contactValue: chat.contactValue,
      car: firstMsgCar
        ? { id: firstMsgCar.id, no: firstMsgCar.no, code: firstMsgCar.code }
        : undefined,
    };
  }

  async getMyChats(userId: number): Promise<ChatInfo[]> {
    const chats = await this.chatRepository.find({
      where: { reciever: { id: userId } },
      relations: ['sender', 'anonymousSender', 'messages', 'messages.car'],
      order: { createdAt: 'DESC' },
    });

    return chats.map((chat) => {
      const sorted = (chat.messages ?? []).sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
      return this.mapChatToInfo(chat, sorted);
    });
  }

  async getChatDetails(chatId: number, userId: number): Promise<ChatDetails> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['reciever', 'sender', 'anonymousSender', 'messages', 'messages.car'],
      order: { messages: { createdAt: 'ASC' } },
    });

    if (!chat) throw new NotFoundException('Chat not found');

    const isParticipant =
      chat.reciever?.id === userId || chat.sender?.id === userId;

    if (!isParticipant) throw new ForbiddenException('Access denied');

    return this.mapChatToDetails(chat);
  }

  async getChatByCarCode(
    code: string,
    userId?: number,
    anonymousId?: string,
  ): Promise<ChatDetails> {
    const car = await this.messagesRepository.manager
      .getRepository(Car)
      .findOne({ where: { code }, relations: ['owner'] });

    if (!car) throw new NotFoundException('Car not found');

    const chat = await this.getOrCreateChat(car, userId, anonymousId);

    const fullChat = await this.chatRepository.findOne({
      where: { id: chat.id },
      relations: ['reciever', 'sender', 'anonymousSender', 'messages', 'messages.car'],
      order: { messages: { createdAt: 'ASC' } },
    });

    return this.mapChatToDetails(fullChat!);
  }

  async sendOwnerMessage(
    chatId: number,
    text: string,
    attachmentUrl: string | undefined,
    ownerId: number,
  ): Promise<ChatMessageInfo> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId, reciever: { id: ownerId } },
      relations: ['reciever', 'sender', 'anonymousSender'],
    });

    if (!chat) throw new ForbiddenException('Access denied');

    const saved = await this.messagesRepository.save({
      chat,
      chatId,
      text,
      userId: ownerId,
      attachmentUrl: attachmentUrl ?? null,
      telegramId: null,
      sourceTelegramId: null,
    });

    return this.mapMessageToInfo(saved, chat);
  }

  async handleWebSocketMessage(
    chatId: number,
    text: string,
    attachmentUrl: string | undefined,
    userId?: number,
    anonymousId?: string,
  ): Promise<ChatMessageInfo> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['reciever', 'sender', 'anonymousSender'],
    });

    if (!chat) throw new NotFoundException('Chat not found');

    const isOwner = userId != null && chat.reciever?.id === userId;
    const isSender =
      (userId != null && chat.sender?.id === userId) ||
      (anonymousId != null && chat.anonymousSender?.id === anonymousId);

    if (!isOwner && !isSender) throw new ForbiddenException('Access denied');

    const saved = await this.messagesRepository.save({
      chat,
      chatId,
      text,
      userId: userId ?? null,
      attachmentUrl: attachmentUrl ?? null,
      telegramId: null,
      sourceTelegramId: null,
    });

    return this.mapMessageToInfo(saved, chat);
  }

  async updateContact(
    chatId: number,
    body: ChatContactBody,
    userId?: number,
    anonymousId?: string,
  ): Promise<void> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['sender', 'anonymousSender'],
    });

    if (!chat) throw new NotFoundException('Chat not found');

    const isSender =
      (userId != null && chat.sender?.id === userId) ||
      (anonymousId != null && chat.anonymousSender?.id === anonymousId);

    if (!isSender) throw new ForbiddenException('Only sender can update contact');

    await this.chatRepository.update(chatId, {
      contactType: body.contactType,
      contactValue: body.contactValue ?? null,
    });
  }

  private async getOrCreateAnonymousId(
    anonymousId: string | undefined,
    userId: number | undefined,
    ip: string,
    userAgent: string,
  ): Promise<string | undefined> {
    if (anonymousId || userId) {
      return anonymousId;
    }

    const newAnonymousUser = await this.anonymousUserRepository.save({
      ip,
      userAgent,
    });

    return newAnonymousUser.id;
  }

  private async getOrCreateChat(
    car: Car,
    userId: number | undefined,
    anonymousId: string | undefined,
  ): Promise<Chat> {
    const senderInfo: FindOptionsWhere<Chat> & DeepPartial<Chat> = userId
      ? { sender: { id: userId } }
      : { anonymousSender: { id: anonymousId } };

    if (!anonymousId && !userId) {
      return this.chatRepository.save({
        reciever: car.owner,
        ...senderInfo,
      });
    }

    const existingChat = await this.chatRepository.findOneBy({
      reciever: { id: car.owner.id },
      ...senderInfo,
    });

    if (existingChat) {
      return existingChat;
    }

    return this.chatRepository.save({
      reciever: car.owner,
      ...senderInfo,
    });
  }

  private async sendTelegramMessage(
    car: Car,
    text: string,
    chatId: number,
    userAgentString?: string,
    coords?: { latitude: number; longitude: number },
  ) {
    const tgText = `${car.no}: новое сообщение:\n${text}\n\n${userAgentString ? `Отправлено из: ${userAgentString}.\n` : ''}\nОтветьте на это сообщение, чтобы отправить ответ отправителю.\n\n#чат${chatId}`;

    const tgMessage = await this.telegramService.sendMessage(tgText, car.owner);

    if (tgMessage && coords) {
      await this.telegramService.sendLocation(coords, car.owner, {
        reply_to_message_id: tgMessage.message_id,
      });
    }

    return tgMessage;
  }

  async sendMessageWithUser(
    car: Car,
    { coords, text }: ChatMessageData,
    userId: number,
    userAgentString?: string,
  ) {
    const chat = await this.getOrCreateChat(car, userId, undefined);

    const tgMessage = await this.sendTelegramMessage(
      car,
      text,
      chat.id,
      userAgentString,
      coords,
    );

    await this.messagesRepository.save({
      chat,
      chatId: chat.id,
      car,
      text,
      location: coords
        ? {
            latitude: coords.latitude,
            longitude: coords.longitude,
          }
        : undefined,
      userId,
      telegramId: tgMessage?.message_id.toString() ?? null,
      attachmentUrl: null,
    });
  }

  async sendMessage(
    car: Car,
    { coords, text }: ChatMessageData,
    userAgent: string,
    ip?: string,
    user?: RequestUser,
    res?: Response,
    req?: Request,
  ) {
    const userId = user?.userId;
    const anonymousId = req?.cookies[this.configService.auth.anonymousIdCookie];

    const newAnonymousId = await this.getOrCreateAnonymousId(
      anonymousId,
      userId,
      ip,
      userAgent,
    );

    const chat = await this.getOrCreateChat(car, userId, newAnonymousId);

    const agentInfo = userAgentParser.parse(userAgent);
    const userAgentString = `${agentInfo.family}, ${agentInfo.os.family}`;

    const tgMessage = await this.sendTelegramMessage(
      car,
      text,
      chat.id,
      userAgentString,
      coords,
    );

    await this.messagesRepository.save({
      chat,
      chatId: chat.id,
      car,
      text,
      location: coords
        ? {
            latitude: coords.latitude,
            longitude: coords.longitude,
          }
        : undefined,
      userId,
      telegramId: tgMessage?.message_id.toString() ?? null,
      attachmentUrl: null,
    });

    if (newAnonymousId) {
      const now = new Date();
      const expires = new Date(now.setDate(now.getDate() + 10000));

      res?.cookie(this.configService.auth.anonymousIdCookie, newAnonymousId, {
        expires,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
      });
    }

    res?.send();
  }

  async getMessagesCount(carId: number): Promise<number> {
    return this.messagesRepository.count({
      where: { car: { id: carId } },
    });
  }

  async getChatsCount(carId: number): Promise<number> {
    return this.chatRepository.count({
      where: { messages: { car: { id: carId } } },
    });
  }
}
