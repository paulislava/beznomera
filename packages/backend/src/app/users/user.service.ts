import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  UserBalance,
  UserProfile,
  UserProfileUpdate,
  UserTransaction,
} from '@paulislava/shared/user/user.types';
import { Repository } from 'typeorm';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import { BalanceChange } from '../entities/balance-change.entity';
import { User } from '../entities/user/user.entity';
import { UserOAuth } from '../entities/user/user-oauth.entity';
import { ConfigService } from '../config/config.service';

@Injectable()
export class UserService {
  private s3Client: S3Client | null = null;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BalanceChange)
    private readonly balanceChangeRepository: Repository<BalanceChange>,
    @InjectRepository(UserOAuth)
    private readonly userOAuthRepository: Repository<UserOAuth>,
    private readonly configService: ConfigService,
  ) {
    const s3 = configService.s3;
    if (s3?.endpoint) {
      this.s3Client = new S3Client({
        endpoint: s3.endpoint,
        region: s3.region,
        credentials: {
          accessKeyId: s3.accessKeyId,
          secretAccessKey: s3.secretAccessKey,
        },
        forcePathStyle: true,
      });
    }
  }

  async getProfile(userId: number): Promise<UserProfile> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    const oauthAccounts = await this.userOAuthRepository.find({
      where: { userId },
    });

    return {
      id: user.id,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      nickname: user.nickname ?? undefined,
      email: user.email ?? undefined,
      tel: user.tel ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      linkedAccounts: oauthAccounts.map((a) => ({
        provider: a.provider,
        email: a.email,
        displayName: a.displayName,
      })),
    };
  }

  async updateProfile(
    userId: number,
    data: UserProfileUpdate,
  ): Promise<UserProfile> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });

    if (data.nickname && data.nickname !== user.nickname) {
      const taken = await this.userRepository.findOne({
        where: { nickname: data.nickname },
      });
      if (taken) {
        throw new BadRequestException('Никнейм уже занят');
      }
    }

    if (data.firstName !== undefined) user.firstName = data.firstName ?? null;
    if (data.lastName !== undefined) user.lastName = data.lastName ?? null;
    if (data.nickname !== undefined) user.nickname = data.nickname ?? null;

    await user.save();
    return this.getProfile(userId);
  }

  async uploadAvatar(
    userId: number,
    file: Express.Multer.File,
  ): Promise<string> {
    if (!this.s3Client) {
      throw new BadRequestException('S3 storage not configured');
    }

    const s3 = this.configService.s3;
    const ext = file.originalname.split('.').pop() ?? 'jpg';
    const key = `avatars/${userId}.${ext}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: s3.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read' as any,
      }),
    );

    const avatarUrl = `${s3.endpoint}/${s3.bucket}/${key}`;

    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    user.avatarUrl = avatarUrl;
    await user.save();

    return avatarUrl;
  }

  async deleteAvatar(userId: number): Promise<void> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    if (!user.avatarUrl) return;

    if (this.s3Client) {
      const s3 = this.configService.s3;
      const key = user.avatarUrl.replace(`${s3.endpoint}/${s3.bucket}/`, '');
      await this.s3Client
        .send(new DeleteObjectCommand({ Bucket: s3.bucket, Key: key }))
        .catch(() => {});
    }

    user.avatarUrl = null;
    await user.save();
  }

  async getUserBalance(userId: number): Promise<UserBalance> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    return {
      pure: user.money,
      bonus: user.bonuses,
      full: user.money + user.bonuses,
    };
  }

  async changeBalance(userId: number, money: number, bonus = 0): Promise<void> {
    const user = await this.userRepository.findOneByOrFail({ id: userId });
    await this.balanceChangeRepository.save({
      userId,
      summ: money,
      bonusSumm: bonus,
    });
    user.money += money;
    user.bonuses += bonus;
    await user.save();
  }

  async getUserTransactions(userId: number): Promise<UserTransaction[]> {
    const transactions = await this.balanceChangeRepository.find({
      where: { userId },
    });

    return transactions.map((transaction) => ({
      summ: transaction.summ,
      bonusSumm: transaction.bonusSumm,
      date: transaction.date.toISOString(),
      title: transaction.description,
      id: transaction.id,
    }));
  }

  async findUserByUsername(username: string) {
    const isNumber = !isNaN(Number(username));

    const user = await this.userRepository.findOne({
      where: isNumber ? { telegramID: username } : { nickname: username },
    });

    if (!user && !isNumber) {
      return this.userRepository.findOne({
        where: { nickname: username },
      });
    }

    return user;
  }
}
