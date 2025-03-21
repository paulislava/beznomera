import { Module } from '@nestjs/common';
import { CarController } from './car.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from '../entities/car/car.entity';
import { CarService } from './car.service';
import { Call } from '../entities/call.entity';
import { TelegramModule } from '../telegram/telegram.module';
import { TelegramService } from '../telegram/telegram.service';
import { AnonymousUser } from '../entities/user/anonymous-user.entity';
import { User } from '../entities/user/user.entity';
import { Chat } from '../entities/chat/chat.entity';
import { ChatMessage } from '../entities/chat/message.entity';
import { ConfigModule } from '../config/config.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Car,
      Call,
      AnonymousUser,
      User,
      Chat,
      ChatMessage,
    ]),
    TelegramModule,
    ConfigModule,
    ChatModule,
  ],
  controllers: [CarController],
  providers: [CarService, TelegramService],
  exports: [CarService],
})
export class CarModule {}
