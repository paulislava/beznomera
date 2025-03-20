import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { session, Telegraf } from 'telegraf';

import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

import { TelegramService } from './telegram.service';
import { TelegramUpdate } from './telegram.update';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from '../entities/chat/message.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ChatMessage]),
    ...(process.env.DISABLE_TELEGRAM === '1'
      ? []
      : [
          TelegrafModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
              token: configService.telegram.token,
              middlewares: [session()],
            }),
          }),
        ]),
  ],
  providers: [Telegraf, TelegramService, TelegramUpdate],
})
export class TelegramModule {}
