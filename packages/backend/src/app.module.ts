import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppController } from './app.controller';
import { HealthController } from './health.controller';
import { ConfigModule } from './app/config/config.module';
import { DatabaseModule } from './app/database/database.module';
import { AppService } from './app.service';
import { AuthModule } from './app/auth/auth.module';
import { HttpClientsModule } from './common/http-clients/http-clients.module';
import { MailModule } from './app/mail/mail.module';
import { UserModule } from './app/users/user.module';
import { CarModule } from './app/car/car.module';
import { TelegramModule } from './app/telegram/telegram.module';
import { FileModule } from './app/file/file.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ChatModule } from './app/chat/chat.module';
import { AdminModule } from './app/admin/admin.module';
import { NotificationModule } from './app/notification/notification.module';
import { LostModule } from './app/lost/lost.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule,
    EventEmitterModule.forRoot({ global: true }),
    DatabaseModule,
    FileModule,
    HttpClientsModule,
    MailModule,
    AuthModule,
    UserModule,
    TelegramModule,
    ChatModule,
    CarModule,
    AdminModule,
    NotificationModule,
    LostModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
