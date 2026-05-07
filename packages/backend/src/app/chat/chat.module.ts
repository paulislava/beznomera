import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from '../entities/chat/chat.entity';
import { ChatMessage } from '../entities/chat/message.entity';
import { AnonymousUser } from '../entities/user/anonymous-user.entity';

import { ConfigModule } from '../config/config.module';
import { ChatService } from './chat.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatMessage, AnonymousUser]),
    ConfigModule,
  ],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
