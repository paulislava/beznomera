import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { session, Telegraf } from 'telegraf';

import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

import { TelegramService } from './telegram.service';
import { TelegramUpdate } from './telegram.update';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from '../entities/chat/message.entity';
import { Car } from '../entities/car/car.entity';
import { StartScene } from './scenes/start.scene';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ChatMessage, Car]),
    ...(process.env.DISABLE_TELEGRAM === '1'
      ? []
      : [
          TelegrafModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
              token: configService.telegram.token,
              middlewares: [session()],
              include: [StartScene],
            }),
          }),
        ]),
  ],
  providers: [Telegraf, TelegramService, TelegramUpdate, StartScene],
})
export class TelegramModule {}
