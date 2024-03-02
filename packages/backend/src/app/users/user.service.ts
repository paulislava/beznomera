import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  UserBalance,
  UserTransaction,
} from '@paulislava/shared/user/user.types';
import { Repository } from 'typeorm';

import { BalanceChange } from '../entities/balance-change.entity';
import { User } from '../entities/user/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BalanceChange)
    private readonly balanceChangeRepository: Repository<BalanceChange>,
  ) {}

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

  async changeBalance(
    userId: number,
    money: number,
    bonus: number = 0,
  ): Promise<void> {
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
      relations: ['payableService'],
    });

    return transactions.map((transaction) => ({
      summ: transaction.summ,
      bonusSumm: transaction.bonusSumm,
      date: transaction.date.toISOString(),
      title: transaction.description
        ? transaction.description
        : transaction.payableService?.name ?? null,
      id: transaction.id,
    }));
  }
}
