import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { User } from '../entities/user/user.entity';
import { LocationInfo } from '@paulislava/shared/car/car.api';
import { ExtraLocation } from 'telegraf/typings/telegram-types';

@Injectable()
export class TelegramService {
  constructor(@InjectBot() private readonly bot: Telegraf) {}
  // private readonly bot: Telegraf;

  // constructor() {}

  async sendMessage(message: string, recipient: User) {
    return this.bot.telegram.sendMessage(recipient.telegramID, message);
  }

  async sendLocation(
    { latitude, longitude }: LocationInfo,
    recipient: User,
    extra?: ExtraLocation,
  ) {
    return this.bot.telegram.sendLocation(
      recipient.telegramID,
      latitude,
      longitude,
      extra,
    );
  }
}
