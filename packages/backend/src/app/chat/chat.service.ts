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
import { User } from '../entities/user/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(ChatMessage)
    private readonly messagesRepository: Repository<ChatMessage>,
    @InjectRepository(AnonymousUser)
    private readonly anonymousUserRepository: Repository<AnonymousUser>,
    @Inject(TelegramService) private readonly telegramService: TelegramService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async sendMessage(
    carNo: string,
    carId: number,
    owner: User,
    { coords, text }: ChatMessageData,
    userAgent: string,
    ip: string,
    res: Response,
    req: Request,
    user?: RequestUser,
  ) {
    const userId = user?.userId;
    const anonymousId = req.cookies[this.configService.auth.anonymousIdCookie];

    let newAnonymousId: string;

    const getAnonymousId = async () => {
      if (anonymousId || userId) {
        return anonymousId;
      }

      const newAnonymousUser = await this.anonymousUserRepository.save({
        ip,
        userAgent,
      });

      newAnonymousId = newAnonymousUser.id;
      return newAnonymousId;
    };

    const getChat = async () => {
      const senderInfo: FindOptionsWhere<Chat> & DeepPartial<Chat> = userId
        ? { sender: { id: userId } }
        : { anonymousSender: { id: await getAnonymousId() } };

      const getExistingChat = async () => {
        if (!anonymousId && !userId) {
          return null;
        }

        return this.chatRepository.findOneBy({
          reciever: owner,
          ...senderInfo,
        });
      };

      const chat = await getExistingChat();

      if (chat) {
        return chat;
      }

      return this.chatRepository.save({
        reciever: owner,
        ...senderInfo,
      });
    };

    const chat = await getChat();

    const agentInfo = userAgentParser.parse(userAgent);

    const tgText = `${carNo}: новое сообщение:\n${text}\n\nОтправлено из: ${agentInfo.family}, ${agentInfo.os.family}.\nОтветьте на это сообщение, чтобы отправить ответ отправителю.`;

    const tgMessage = await this.telegramService.sendMessage(tgText, owner);

    await this.messagesRepository.save({
      chat,
      car: { id: carId },
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

    if (coords) {
      await this.telegramService.sendLocation(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        owner,
        {
          reply_to_message_id: tgMessage.message_id,
        },
      );
    }

    if (newAnonymousId) {
      const now = new Date();
      const expires = new Date(now.setDate(now.getDate() + 10000));

      res.cookie(this.configService.auth.anonymousIdCookie, newAnonymousId, {
        expires,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
      });
    }

    res.send();
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
