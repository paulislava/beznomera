import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ConfigModule } from '../config/config.module';
import { HttpClientsModule } from '../../common/http-clients/http-clients.module';
import { MailModule } from '../mail/mail.module';
import { AuthCode } from '../entities/auth-code.entity';
import { User } from '../entities/user/user.entity';
import { UserDraft } from '../entities/user/user-draft.entity';
import { UserOAuth } from '../entities/user/user-oauth.entity';
import { ConfigService } from '../config/config.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { YandexStrategy } from './strategies/yandex.strategy';
import { VkStrategy } from './strategies/vk.strategy';
import { AppleStrategy } from './strategies/apple.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(configService: ConfigService): JwtModuleOptions {
        return {
          secret: configService.auth.jwtSecret,
        };
      },
    }),
    MailModule,
    HttpClientsModule,
    TypeOrmModule.forFeature([AuthCode, User, UserDraft, UserOAuth]),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    YandexStrategy,
    VkStrategy,
    AppleStrategy,
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
