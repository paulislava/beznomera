import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectBot, On } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { User } from '../entities/user/user.entity';
import { LocationInfo } from '@paulislava/shared/car/car.types';
import { ExtraLocation } from 'telegraf/typings/telegram-types';
import { Buffer } from 'buffer';
import { RequestUser } from '@paulislava/shared/user/user.types';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private available = false;

  constructor(@InjectBot() private readonly bot: Telegraf) {}

  async onModuleInit() {
    // Telegraf's startPolling вызывает loop() без await — Promise теряется,
    // и 409/401 становятся unhandled rejection, роняя процесс.
    // Патчим startPolling на экземпляре, добавляя .catch() к loop().
    const bot = this.bot as any;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    bot.startPolling = function (allowedUpdates: string[] = []) {
      // telegraf/lib/core/network/polling не экспортируется в exports-поле package.json,
      // поэтому используем resolve через основной entrypoint
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const path = require('path');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Polling } = require(
        path.join(
          path.dirname(require.resolve('telegraf')),
          'core/network/polling',
        ),
      );
      bot.polling = new Polling(bot.telegram, allowedUpdates);
      bot.polling
        .loop(async (updates: any) => {
          await bot.handleUpdates(updates);
        })
        .catch((err: any) => {
          const code = err?.code ?? err?.response?.error_code;
          if (code === 409) {
            self.logger.error(
              'Telegram 409 Conflict: работает другой экземпляр бота. Сервис Telegram отключён.',
            );
          } else {
            self.logger.error(
              'Ошибка polling-цикла Telegram, сервис отключён',
              err,
            );
          }
          self.available = false;
        });
    };

    try {
      await this.bot.launch();
      this.available = true;
      this.logger.log('Telegram bot launched successfully');
    } catch (error) {
      this.available = false;
      this.logger.error(
        'Telegram bot failed to launch, running without Telegram',
        error,
      );
    }
  }

  @On('text')
  async handleMessage() {
    console.log('message');
  }

  async sendMessage(
    message: string,
    recipient: User,
    replyToMessageId?: number,
  ) {
    if (!this.available) {
      this.logger.warn(
        `Telegram unavailable, skipping sendMessage to ${recipient.telegramID}`,
      );
      return null;
    }
    try {
      return await this.bot.telegram.sendMessage(
        recipient.telegramID,
        message,
        {
          parse_mode: 'HTML',
          reply_to_message_id: replyToMessageId,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to send Telegram message to ${recipient.telegramID}`,
        error,
      );
      return null;
    }
  }

  async sendLocation(
    { latitude, longitude }: LocationInfo,
    recipient: User,
    extra?: ExtraLocation,
  ) {
    if (!this.available) {
      this.logger.warn(
        `Telegram unavailable, skipping sendLocation to ${recipient.telegramID}`,
      );
      return null;
    }
    try {
      return await this.bot.telegram.sendLocation(
        recipient.telegramID,
        latitude,
        longitude,
        extra,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send Telegram location to ${recipient.telegramID}`,
        error,
      );
      return null;
    }
  }

  async sendPhoto(
    base64Image: string,
    recipient: RequestUser,
    filename: string,
    caption?: string,
  ) {
    if (!this.available) {
      this.logger.warn(
        `Telegram unavailable, skipping sendPhoto to ${recipient.telegramID}`,
      );
      return null;
    }
    const buffer = Buffer.from(
      base64Image.replace(/^data:image\/\w+;base64,/, ''),
      'base64',
    );
    try {
      return await this.bot.telegram.sendDocument(
        recipient.telegramID,
        {
          source: buffer,
          filename: filename,
        },
        {
          caption,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to send Telegram photo to ${recipient.telegramID}`,
        error,
      );
      return null;
    }
  }
}
