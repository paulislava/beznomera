import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '../config/config.module';
import { BalanceChange } from '../entities/balance-change.entity';
import { User } from '../entities/user/user.entity';
import { Car } from '../entities/car/car.entity';
import { UserOAuth } from '../entities/user/user-oauth.entity';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, BalanceChange, Car, UserOAuth]),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
