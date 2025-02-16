import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { User } from '../entities/user/user.entity';

@Injectable()
export class TelegramService {
  constructor(@InjectBot() private readonly bot: Telegraf) {}
  // private readonly bot: Telegraf;

  // constructor() {}

  async sendMessage(message: string, recipient: User) {
    await this.bot.telegram.sendMessage(recipient.telegramID, message);
  }
}
