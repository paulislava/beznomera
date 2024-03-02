import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CurrentAdmin } from 'adminjs';

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

    const now = new Date();
    const expires = new Date(now.setDate(now.getDate() + 30));
    const requestUser: RequestUser = {
      userId: user.id,
      organizationId: user.organizationId,
    };
    const token = this.jwtService.sign(requestUser, { expiresIn: '30d' });
    res.cookie(this.configService.auth.jwtCookie, token, {
      expires,
    });
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

  @Transactional()
  async authAdmin(
    email: string,
    password: string,
  ): Promise<CurrentAdmin | null> {
    const adminUser = await this.adminUserRepository.findOneBy({ email });
    if (!adminUser) {
      return null;
    }

    if (!this.comparePassword(password, adminUser.passwordHash)) {
      return null;
    }

    adminUser.authorizedAt = new Date();
    await adminUser.save();

    return {
      id: String(adminUser.id),
      email: adminUser.email,
      title: adminUser.title,
    };
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

  private comparePassword(password: string, passwordHash: string): boolean {
    return bcrypt.compareSync(this.getPasswordPhrase(password), passwordHash);
  }

  private getPasswordHash(password: string): string {
    return bcrypt.hashSync(
      this.getPasswordPhrase(password),
      this.configService.auth.passwordSaltRounds,
    );
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
