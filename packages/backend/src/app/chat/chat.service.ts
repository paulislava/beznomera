import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, DeepPartial } from 'typeorm';
import { Chat } from '../entities/chat/chat.entity';
import { ChatMessage } from '../entities/chat/message.entity';
import { AnonymousUser } from '../entities/user/anonymous-user.entity';
import { TelegramService } from '../telegram/telegram.service';
import { ConfigService } from '../config/config.service';
import { Response, Request } from 'express';
import { RequestUser } from '../users/user.types';
import userAgentParser from 'useragent';
import { ChatMessageData } from './chat.types';
import { Car } from '../entities/car/car.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(ChatMessage)
    private readonly messagesRepository: Repository<ChatMessage>,
    @InjectRepository(AnonymousUser)
    private readonly anonymousUserRepository: Repository<AnonymousUser>,
    private readonly telegramService: TelegramService,
    private readonly configService: ConfigService,
  ) {}

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
      reciever: car.owner,
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
    userAgentString?: string,
    coords?: { latitude: number; longitude: number },
  ) {
    const tgText = `${car.no}: новое сообщение:\n${text}\n\n${userAgentString ? `Отправлено из: ${userAgentString}.\n` : ''}\nОтветьте на это сообщение, чтобы отправить ответ отправителю.`;

    const tgMessage = await this.telegramService.sendMessage(tgText, car.owner);

    if (coords) {
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
      userAgentString,
      coords,
    );

    await this.messagesRepository.save({
      chat,
      car,
      text,
      location: coords
        ? {
            latitude: coords.latitude,
            longitude: coords.longitude,
          }
        : undefined,
      userId,
      telegramId: tgMessage.message_id,
    });
  }

  async sendMessage(
    car: Car,
    { coords, text }: ChatMessageData,
    userAgent: string,
    ip: string,
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
      userAgentString,
      coords,
    );

    await this.messagesRepository.save({
      chat,
      car,
      text,
      location: coords
        ? {
            latitude: coords.latitude,
            longitude: coords.longitude,
          }
        : undefined,
      userId,
      telegramId: tgMessage.message_id,
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
