import { Module, forwardRef } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { session, Telegraf } from 'telegraf';

import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { ChatModule } from '../chat/chat.module';

import { TelegramService } from './telegram.service';
import { TelegramUpdate } from './telegram.update';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from '../entities/chat/message.entity';
import { Car } from '../entities/car/car.entity';
import { MessageScene } from './scenes/message.scene';
import { User } from '../entities/user/user.entity';
@Module({
  imports: [
    ConfigModule,
    forwardRef(() => ChatModule),
    TypeOrmModule.forFeature([ChatMessage, Car, User]),
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
  providers: [Telegraf, MessageScene, TelegramService, TelegramUpdate],
})
export class TelegramModule {}
