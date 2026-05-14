import { BadRequestException, Injectable } from '@nestjs/common';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional';
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
import { UserOAuth } from '../entities/user/user-oauth.entity';
import { RequestUser } from '@paulislava/shared/user/user.types';

import { AuthMode } from './auth.types';
import {
  AuthServiceException,
  UserNotFound,
  WrongAuthCode,
} from './auth.exceptions';

import { SmsHttpClientService } from '~/common/http-clients/sms-http-client/sms-http-client.service';
import { randomDigitsString } from '~/common/utils/randomDigitsString';
import {
  AuthTelegramData,
  LinkedAccount,
  OAuthProvider,
} from '@paulislava/shared/auth/auth.types';
import { createHash, createHmac } from 'crypto';
import querystring from 'querystring';
import {
  AUTH_TOKEN_EXPIRATION_TIME,
  WebAppUser,
  TOKEN_VERSION,
} from '@paulislava/shared/auth/auth.api';
import { OAuthProfileData } from './strategies/oauth-profile.types';

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
    @InjectRepository(UserOAuth)
    private readonly userOAuthRepository: Repository<UserOAuth>,
  ) {}

  @Transactional()
  async authFinish(
    authMode: AuthMode,
    identifier: string,
    code: string,
    res: Response,
  ): Promise<string> {
    const authCode = await this.authCheck(authMode, identifier, code);
    const user = await this.getOrCreateUserByAuthCode(authCode);

    return this.saveAuthCookie(user, res);
  }

  @Transactional()
  async authStart(
    authMode: AuthMode,
    identifier: string,
    allowRegistration = false,
  ): Promise<void> {
    const userParams = this.getUserParams(authMode, identifier);

    const user = await this.userRepository.findOne({ where: userParams });

    let userDraft: UserDraft | null = null;

    if (!user) {
      userDraft = await this.userDraftRepository.findOne({ where: userParams });

      if (!userDraft) {
        if (!allowRegistration) {
          throw new UserNotFound(authMode, identifier);
        }
        const draftData: DeepPartial<UserDraft> =
          authMode === AuthMode.EMAIL
            ? { email: identifier }
            : { tel: identifier };
        userDraft = await this.userDraftRepository.save(
          this.userDraftRepository.create(draftData),
        );
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

  async authTelegram(data: AuthTelegramData, res: Response): Promise<string> {
    this.checkTelegramData(data);

    const findUser = await this.userRepository.findOne({
      where: {
        telegramID: data.id.toString(),
      },
    });

    if (findUser) {
      return this.saveAuthCookie(findUser, res);
    }

    const user = await this.userRepository.save(
      this.userRepository.create({
        firstName: data.first_name,
        // @ts-expect-error last_name doesn't exists in type. Why?
        lastName: data.last_name,
        nickname: data.username,
        telegramID: data.id.toString(),
      }),
    );

    return this.saveAuthCookie(user, res);
  }

  async authTelegramWebApp(data: string, res: Response): Promise<string> {
    const userData = this.checkTelegramWebAppData(data);

    if (!userData.id) {
      throw new AuthServiceException('No telegram id in initData');
    }

    const findUser = await this.userRepository.findOne({
      where: {
        telegramID: userData.id.toString(),
      },
    });

    if (findUser) {
      return this.saveAuthCookie(findUser, res);
    }

    const user = await this.userRepository.save(
      this.userRepository.create({
        firstName: userData.first_name,
        lastName: userData.last_name,
        nickname: userData.username,
        telegramID: userData.id.toString(),
      }),
    );

    return this.saveAuthCookie(user, res);
  }

  @Transactional()
  async authOAuth(
    oauthData: OAuthProfileData,
    currentUserId: number | null,
    res: Response,
  ): Promise<string> {
    const { provider, providerUserId, email, displayName, avatarUrl } =
      oauthData;

    // Linking mode: user is already logged in
    if (currentUserId !== null) {
      const existing = await this.userOAuthRepository.findOne({
        where: { provider, providerUserId },
      });
      if (existing && existing.userId !== currentUserId) {
        throw new BadRequestException(
          'Этот аккаунт уже привязан к другому пользователю',
        );
      }
      if (!existing) {
        await this.userOAuthRepository.save(
          this.userOAuthRepository.create({
            userId: currentUserId,
            provider,
            providerUserId,
            email,
            displayName,
          }),
        );
      }
      const user = await this.userRepository.findOneOrFail({
        where: { id: currentUserId },
      });
      return this.saveAuthCookie(user, res);
    }

    // Auth mode: find existing OAuth link
    const existingOAuth = await this.userOAuthRepository.findOne({
      where: { provider, providerUserId },
      relations: ['user'],
    });

    if (existingOAuth) {
      return this.saveAuthCookie(existingOAuth.user, res);
    }

    // Try to find user by email
    let user: User | null = null;
    if (email) {
      user = await this.userRepository.findOne({ where: { email } });
    }

    // Create new user if not found
    if (!user) {
      user = await this.userRepository.save(
        this.userRepository.create({
          firstName: displayName?.split(' ')[0] ?? null,
          lastName: displayName?.split(' ').slice(1).join(' ') || null,
          email,
          avatarUrl,
        }),
      );
    }

    await this.userOAuthRepository.save(
      this.userOAuthRepository.create({
        userId: user.id,
        provider,
        providerUserId,
        email,
        displayName,
      }),
    );

    return this.saveAuthCookie(user, res);
  }

  async unlinkOAuth(userId: number, provider: OAuthProvider): Promise<void> {
    const record = await this.userOAuthRepository.findOne({
      where: { userId, provider },
    });
    if (!record) {
      throw new BadRequestException('Аккаунт не привязан');
    }
    await this.userOAuthRepository.remove(record);
  }

  async getLinkedAccounts(userId: number): Promise<LinkedAccount[]> {
    const records = await this.userOAuthRepository.find({ where: { userId } });
    return records.map((r) => ({
      provider: r.provider,
      email: r.email,
      displayName: r.displayName,
    }));
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

  saveAuthCookie(user: User, res: Response): string {
    const expires = new Date(Date.now() + AUTH_TOKEN_EXPIRATION_TIME);

    const requestUser: RequestUser = {
      userId: user.id,
      telegramID: user.telegramID,
      tokenVersion: TOKEN_VERSION,
    };

    if (user.isAdmin) {
      requestUser.isAdmin = true;
    }

    const token = this.jwtService.sign(requestUser, {
      expiresIn: AUTH_TOKEN_EXPIRATION_TIME,
    });
    res.cookie(this.configService.auth.jwtCookie, token, {
      expires,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    return token;
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

    const dataCheckString = Object.keys(data)
      .sort()
      .map((key) => `${key}=${data[key]}`)
      .join('\n');

    const hmac = createHmac('sha256', secretKey as any)
      .update(dataCheckString)
      .digest('hex');

    if (hmac !== hash) {
      throw new AuthServiceException('Telegram authentication failed');
    }
  }

  private checkTelegramWebAppData(data: string): WebAppUser {
    const parsedData = querystring.parse(data);

    const hash = parsedData.hash;
    if (!hash) {
      throw new Error('Hash not found in initData');
    }

    delete parsedData.hash;

    const sortedKeys = Object.keys(parsedData).sort();

    const dataCheckString = sortedKeys
      .map((key) => `${key}=${parsedData[key]}`)
      .join('\n');

    const secretKey = createHmac('sha256', 'WebAppData')
      .update(this.configService.telegram.token)
      .digest();

    const computedHash = createHmac('sha256', secretKey as any)
      .update(dataCheckString)
      .digest('hex');

    if (computedHash === hash) {
      return JSON.parse(parsedData.user as string);
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
