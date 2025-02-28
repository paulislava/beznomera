import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from '../entities/car/car.entity';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { CarInfo, ShortCarInfo } from '@paulislava/shared/car/car.types';
import { Call } from '../entities/call.entity';
import { TelegramService } from '../telegram/telegram.service';
import { RequestUser } from '../users/user.types';
import { CarCallBody, CarMessageBody } from '@paulislava/shared/car/car.api';
import { Agent } from 'useragent';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore cannot find module?
import { lookup } from 'ip-location-api';
import { CALL_TIMEOUT_S } from '~/constants';
import { CallNeedTimeoutException } from './car.exceptions';
import { Chat } from '../entities/chat/chat.entity';
import { ChatMessage } from '../entities/chat/message.entity';
import { AnonymousUser } from '../entities/user/anonymous-user.entity';
import { MessageSource } from '@paulislava/shared/chat/chat.types';
import userAgentParser from 'useragent';
import { ConfigService } from '../config/config.service';
import { Response, Request } from 'express';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car) private readonly carRepository: Repository<Car>,
    @InjectRepository(Call) private readonly callRepository: Repository<Call>,
    @InjectRepository(AnonymousUser)
    private readonly anonymousUserRepository: Repository<AnonymousUser>,
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(ChatMessage)
    private readonly messagesRepository: Repository<ChatMessage>,
    @Inject(TelegramService) private readonly telegramService: TelegramService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async getInfo(code: string): Promise<CarInfo> {
    const {
      id,
      no,
      model,
      brand,
      brandRaw,
      year,
      version,
      color,
      owner,
      rawColor,
      imageUrl,
      imageRatio: imageRatio,
    } = await this.carRepository.findOneOrFail({
      where: { code },
      relations: ['owner', 'brand', 'color'],
    });

    return {
      id,
      no,
      brand,
      brandRaw,
      model,
      year,
      version,
      color,
      rawColor,
      imageUrl,
      imageRatio: imageRatio,
      owner: {
        firstName: owner.firstName,
        lastName: owner.lastName,
        nickname: owner.nickname,
        tel: owner.tel,
      },
    };
  }

  async call(
    code: string,
    { coords }: CarCallBody,
    userAgent: Agent,
    ip: string,
  ): Promise<void> {
    const { id, no, owner } = await this.carRepository.findOneOrFail({
      where: { code },
      relations: ['owner'],
    });

    const lastCall = await this.callRepository.findOne({
      where: { car: { id }, ip },
      order: { date: 'DESC' },
    });

    if (
      lastCall &&
      (new Date().getTime() - lastCall.date.getTime()) / 1000 < CALL_TIMEOUT_S
    ) {
      throw new CallNeedTimeoutException(id);
    }

    let text = `${no}: позвали водителя.\nОтправлено из: ${userAgent.family}, ${userAgent.os.family}`;

    const ipInfo = await lookup(ip);
    if (ipInfo?.city) {
      text += `\n${ipInfo.city}, ${ipInfo.region1_name}${ipInfo.region2_name && `, ${ipInfo.region2_name}`}, ${ipInfo.country_name}`;
    }

    await this.callRepository.save({ car: { id }, ip });

    const message = await this.telegramService.sendMessage(text, owner);

    if (coords) {
      await this.telegramService.sendLocation(coords, owner, {
        reply_to_message_id: message.message_id,
      });
    }
  }

  async list({ userId }: RequestUser): Promise<ShortCarInfo[]> {
    const cars = await this.carRepository.findBy({
      owner: { id: userId },
    });

    return cars;
  }

  async sendMessage(
    code: string,
    { coords, text }: CarMessageBody,
    userAgent: string,
    ip: string,
    res: Response,
    req: Request,
  ) {
    const userId = req.user?.userId;
    const anonymousId = req.cookies[this.configService.auth.anonymousIdCookie];

    const { id, no, owner } = await this.carRepository.findOneOrFail({
      where: { code },
      relations: ['owner'],
    });

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
          reciever: { id: owner.id },
          ...senderInfo,
        });
      };

      const chat = await getExistingChat();

      if (chat) {
        return chat;
      }

      return this.chatRepository.save({
        reciever: { id: owner.id },

        ...senderInfo,
      });
    };

    const chat = await getChat();

    const message = await this.messagesRepository.save({
      chat,
      car: { id },
      text,
      location: coords,
      source: MessageSource.Sender,
    });

    const agentInfo = userAgentParser.parse(userAgent);

    const tgText = `${no}: новое сообщение:\n${text}\n\nОтправлено из: ${agentInfo.family}, ${agentInfo.os.family}.\nОтветьте на это сообщение, чтобы отправить ответ отправителю.`;

    const tgMessage = await this.telegramService.sendMessage(tgText, owner);

    if (coords) {
      await this.telegramService.sendLocation(coords, owner, {
        reply_to_message_id: tgMessage.message_id,
      });
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
}
