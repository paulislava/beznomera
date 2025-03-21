import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from '../entities/chat/chat.entity';
import { ChatMessage } from '../entities/chat/message.entity';
import { AnonymousUser } from '../entities/user/anonymous-user.entity';

import { TelegramModule } from '../telegram/telegram.module';
import { ConfigModule } from '../config/config.module';
import { ChatService } from './chat.service';
import { TelegramService } from '../telegram/telegram.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatMessage, AnonymousUser]),
    ConfigModule,
    TelegramModule,
  ],
  providers: [ChatService, TelegramService],
  exports: [ChatService],
})
export class ChatModule {}
