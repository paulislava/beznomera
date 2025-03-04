import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { ConfigService } from '../config/config.service';
import { authMessage } from '../templates/messages';
import { MailService } from '../mail/mail.service';
import { AuthCode } from '../entities/auth-code.entity';
import { User } from '../entities/user/user.entity';
import { UserDraft } from '../entities/user/user-draft.entity';
import { UserCore } from '../entities/user/user-core.entity';
import { RequestUser } from '../users/user.types';
import { AdminUser } from '../entities/admin-user.entity';

import { AuthMode } from './auth.types';
import {
  AuthServiceException,
  UserNotFound,
  WrongAuthCode,
} from './auth.exceptions';

import { SmsHttpClientService } from '~/common/http-clients/sms-http-client/sms-http-client.service';
import { randomDigitsString } from '~/common/utils/randomDigitsString';
import { AuthTelegramData } from '@paulislava/shared/auth/auth.types';
import { createHash, createHmac } from 'crypto';
import querystring from 'querystring';
import { WebAppUser } from '@paulislava/shared/auth/auth.api';

@Injectable()
export class AuthService {
  constructor(
    private readonly smsHttpClientService: SmsHttpClientService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(AuthCode)
    private readonly authCodeRepository: Repository<AuthCode>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserDraft)
    private readonly userDraftRepository: Repository<UserDraft>,
    @InjectRepository(AdminUser)
    private readonly adminUserRepository: Repository<AdminUser>,
  ) {}

  @Transactional()
  async authFinish(
    authMode: AuthMode,
    identifier: string,
    code: string,
    res: Response,
  ): Promise<void> {
    const authCode = await this.authCheck(authMode, identifier, code);
    const user = await this.getOrCreateUserByAuthCode(authCode);

    this.saveAuthCookie({ userId: user.id }, res);
  }

  @Transactional()
  async authStart(authMode: AuthMode, identifier: string): Promise<void> {
    const userParams = this.getUserParams(authMode, identifier);

    const user = await this.userRepository.findOne({ where: userParams });

    let userDraft: UserDraft | null = null;

    if (!user) {
      userDraft = await this.userDraftRepository.findOne({ where: userParams });

      if (!userDraft) {
        throw new UserNotFound(authMode, identifier);
      }
    }

    const code = randomDigitsString(this.configService.auth.codeLength);
    const message = authMessage(code);

    await this.authCodeRepository.insert({
      authMode,
      identifier,
      code,
      userId: user?.id,
      userDraftId: userDraft?.id,
    });

    switch (authMode) {
      case AuthMode.TEL:
        await this.smsHttpClientService.sendMessage(
          identifier,
          message.sms ?? message.plain ?? message.content,
        );
        break;
      case AuthMode.EMAIL:
        await this.mailService.sendAuthCode(identifier, code);
        break;
    }
  }

  async authTelegram(data: AuthTelegramData, res: Response): Promise<void> {
    this.checkTelegramData(data);

    const findUser = await this.userRepository.findOne({
      where: {
        telegramID: data.id,
      },
    });

    if (findUser) {
      this.saveAuthCookie({ userId: findUser.id }, res);
      return;
    }

    const user = await this.userRepository.save(
      this.userRepository.create({
        firstName: data.first_name,
        // @ts-expect-error no type
        lastName: data.last_name,
        nickname: data.username,
        telegramID: data.id,
      }),
    );

    this.saveAuthCookie({ userId: user.id }, res);
  }

  async authTelegramWebApp(data: string, res: Response): Promise<void> {
    const userData = this.checkTelegramWebAppData(data);

    if (!userData.id) {
      throw new AuthServiceException('No telegram id in initData');
    }

    const findUser = await this.userRepository.findOne({
      where: {
        telegramID: userData.id,
      },
    });

    if (findUser) {
      this.saveAuthCookie({ userId: findUser.id }, res);
      return;
    }

    const user = await this.userRepository.save(
      this.userRepository.create({
        firstName: userData.first_name,
        lastName: userData.last_name,
        nickname: userData.username,
        telegramID: userData.id,
      }),
    );

    this.saveAuthCookie({ userId: user.id }, res);
  }

  private async getOrCreateUserByAuthCode(authCode: AuthCode): Promise<User> {
    if (authCode.user) {
      return authCode.user;
    }

    if (!authCode.userDraftId) {
      throw new AuthServiceException(
        `No user draft id for auth code with id ${authCode.id}`,
      );
    }

    const userDraft = await this.userDraftRepository.findOneOrFail({
      where: { id: authCode.userDraftId },
      relations: ['user'],
    });

    if (userDraft.user) {
      return userDraft.user;
    }

    const user = await this.userRepository.save(
      this.userRepository.create({ ...userDraft, id: undefined }),
    );
    userDraft.userId = user.id;
    await userDraft.save();

    return user;
  }

  private saveAuthCookie(requestUser: RequestUser, res: Response) {
    const now = new Date();
    const expires = new Date(now.setDate(now.getDate() + 30));

    const token = this.jwtService.sign(requestUser, { expiresIn: '30d' });
    res.cookie(this.configService.auth.jwtCookie, token, {
      expires,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
  }

  private comparePassword(password: string, passwordHash: string): boolean {
    return bcrypt.compareSync(this.getPasswordPhrase(password), passwordHash);
  }

  private getPasswordHash(password: string): string {
    return bcrypt.hashSync(
      this.getPasswordPhrase(password),
      this.configService.auth.passwordSaltRounds,
    );
  }

  private checkTelegramData({ hash, ...data }: AuthTelegramData) {
    const secretKey = createHash('sha256')
      .update(this.configService.telegram.token)
      .digest();

    // this is the data to be authenticated i.e. telegram user id, first_name, last_name etc.
    const dataCheckString = Object.keys(data)
      .sort()
      .map((key) => `${key}=${data[key]}`)
      .join('\n');

    // run a cryptographic hash function over the data to be authenticated and the secret
    const hmac = createHmac('sha256', secretKey as any)
      .update(dataCheckString)
      .digest('hex');

    // compare the hash that you calculate on your side (hmac) with what Telegram sends you (hash) and return the result
    if (hmac !== hash) {
      throw new AuthServiceException('Telegram authentication failed');
    }
  }

  private checkTelegramWebAppData(data: string): WebAppUser {
    const parsedData = querystring.parse(data);

    // Извлекаем хэш из данных
    const hash = parsedData.hash;
    if (!hash) {
      throw new Error('Hash not found in initData');
    }

    // Удаляем хэш из объекта, чтобы он не участвовал в вычислении хэша
    delete parsedData.hash;

    // Сортируем ключи в алфавитном порядке
    const sortedKeys = Object.keys(parsedData).sort();

    // Создаем строку для хэширования
    const dataCheckString = sortedKeys
      .map((key) => `${key}=${parsedData[key]}`)
      .join('\n');

    // Вычисляем хэш с использованием HMAC-SHA-256
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(this.configService.telegram.token)
      .digest();

    const computedHash = createHmac('sha256', secretKey as any)
      .update(dataCheckString)
      .digest('hex');

    // Сравниваем вычисленный хэш с предоставленным хэшем
    if (computedHash === hash) {
      return JSON.parse(parsedData.user as string); // Данные валидны
    } else {
      throw new AuthServiceException('Invalid initData hash');
    }
  }

  private getPasswordPhrase(password: string): string {
    return password + this.configService.auth.passwordSalt;
  }

  private async authCheck(
    authMode: AuthMode,
    identifier: string,
    code: string,
  ): Promise<AuthCode> {
    const authCode = await this.authCodeRepository.findOne({
      where: { identifier, authMode, code, closed: false },
      relations: ['user'],
    });

    if (!authCode) {
      throw new WrongAuthCode();
    }

    authCode.closed = true;
    await authCode.save();
    return authCode;
  }

  private getUserParams(
    authMode: AuthMode,
    identifier: string,
  ): FindOptionsWhere<UserCore> {
    switch (authMode) {
      case AuthMode.EMAIL:
        return { email: identifier };
      case AuthMode.TEL:
        return { tel: identifier };
    }
  }
}
