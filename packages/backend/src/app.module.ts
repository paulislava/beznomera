import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppController } from './app.controller';
import { ConfigModule } from './app/config/config.module';
import { DatabaseModule } from './app/database/database.module';
import { AppService } from './app.service';
import { AuthModule } from './app/auth/auth.module';
import { HttpClientsModule } from './common/http-clients/http-clients.module';
import { MailModule } from './app/mail/mail.module';
import { UserModule } from './app/users/user.module';

const test = 'test';

@Module({
  imports: [
    ConfigModule,
    EventEmitterModule.forRoot({ global: true }),
    DatabaseModule,
    HttpClientsModule,
    MailModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
