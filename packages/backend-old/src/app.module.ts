import { Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { AdminModule } from '@adminjs/nestjs'
import AdminJS, { LocaleTranslationsBlock, ResourceWithOptions } from 'adminjs'
import { Database, Resource } from '@adminjs/typeorm'
import { BaseEntity, ObjectType } from 'typeorm'
import { MulterModule } from '@nestjs/platform-express'

import { AppController } from './app.controller'
import { ConfigModule } from './app/config/config.module'
import { DatabaseModule } from './app/database/database.module'
import { AppService } from './app.service'
import { AuthModule } from './app/auth/auth.module'
import { HttpClientsModule } from './common/http-clients/http-clients.module'
import { MailModule } from './app/mail/mail.module'
import { AppAdminModule } from './app/admin/admin.module'
import { UserModule } from './app/users/user.module'
import { PaymentModule } from './app/payments/payment.module'
import { ASSETS_FILE_PATH } from './constants'

@Module({
  imports: [
    ConfigModule,
    EventEmitterModule.forRoot({ global: true }),
    DatabaseModule,
    MulterModule.register({
      dest: ASSETS_FILE_PATH
    }),
    HttpClientsModule,
    MailModule,
    AuthModule,
    AppAdminModule,
    UserModule,
    PaymentModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
