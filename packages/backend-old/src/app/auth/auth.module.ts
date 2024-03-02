import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt'

import { ConfigModule } from '../config/config.module'
import { HttpClientsModule } from '../../common/http-clients/http-clients.module'
import { MailModule } from '../mail/mail.module'
import { AuthCode } from '../entities/auth-code.entity'
import { User } from '../entities/user/user.entity'
import { UserDraft } from '../entities/user/user-draft.entity'
import { ConfigService } from '../config/config.service'
import { AdminUser } from '../entities/admin-user.entity'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(configService: ConfigService): JwtModuleOptions {
        return {
          secret: configService.auth.jwtSecret
        }
      }
    }),
    MailModule,
    HttpClientsModule,
    TypeOrmModule.forFeature([AuthCode, User, UserDraft, AdminUser])
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
