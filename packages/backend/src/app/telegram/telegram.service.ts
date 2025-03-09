import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { User } from '../entities/user/user.entity';
import { LocationInfo } from '@paulislava/shared/car/car.types';
import { ExtraLocation } from 'telegraf/typings/telegram-types';
import { Buffer } from 'buffer';
import { RequestUser } from '../users/user.types';

@Injectable()
export class TelegramService {
  constructor(@InjectBot() private readonly bot: Telegraf) {}
  // private readonly bot: Telegraf;

  // constructor() {}

  async sendMessage(message: string, recipient: User) {
    return this.bot.telegram.sendMessage(recipient.telegramID, message, {
      parse_mode: 'HTML',
    });
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

  async sendPhoto(
    base64Image: string,
    recipient: RequestUser,
    filename: string,
    caption?: string,
  ) {
    const buffer = Buffer.from(
      base64Image.replace(/^data:image\/\w+;base64,/, ''),
      'base64',
    );
    return this.bot.telegram.sendDocument(
      recipient.telegramID,
      {
        source: buffer,
        filename: filename,
      },
      {
        caption,
      },
    );
  }
}
