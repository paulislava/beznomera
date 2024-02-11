import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ConfigModule } from '../config/config.module'
import { BalanceChange } from '../entities/balance-change.entity'
import { PaymentOption } from '../entities/payment-option.entity'
import { Payment } from '../entities/payment.entity'
import { User } from '../entities/user/user.entity'
import { UserModule } from '../users/user.module'
import { UserService } from '../users/user.service'

import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'

@Module({
  imports: [
    ConfigModule,
    UserModule,
    TypeOrmModule.forFeature([Payment, PaymentOption, User, BalanceChange])
  ],
  providers: [PaymentService, UserService],
  controllers: [PaymentController]
})
export class PaymentModule {}
