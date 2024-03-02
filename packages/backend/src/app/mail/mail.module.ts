import { join, resolve } from 'path'

import { Module } from '@nestjs/common'
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'

import { ConfigModule } from '../config/config.module'
import { ConfigService } from '../config/config.service'

import { MailService } from './mail.service'

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(configService: ConfigService): MailerOptions {
        return {
          transport: {
            host: configService.mail.host,
            secure: configService.mail.secure,
            port: configService.mail.port,
            auth: {
              user: configService.mail.login,
              pass: configService.mail.password
            }
          },
          defaults: {
            from: configService.mail.defaultFrom
          },
          template: {
            dir: join(resolve(__dirname, '..'), 'templates', 'mail'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: false
            }
          }
        }
      }
    })
  ],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}
