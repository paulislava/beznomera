import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { PaymentOptionFull } from '@paulislava/shared/payment/payment.types'
import { Repository } from 'typeorm'

import { PaymentOption } from '../entities/payment-option.entity'
import { Payment, PaymentStatus } from '../entities/payment.entity'
import { UserService } from '../users/user.service'

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentOption)
    private readonly paymentOptionRepository: Repository<PaymentOption>,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    private readonly userService: UserService
  ) {}

  async getPaymentOptions(organizationId: number): Promise<PaymentOptionFull[]> {
    const options = await this.paymentOptionRepository.findBy({ organizationId })
    return options
      .sort((a, b) => a.summ - b.summ)
      .map(option => ({
        bonusPercent: option.bonusPercent,
        bonusSumm: option.bonusSumm,
        id: option.id,
        summ: option.summ,
        recommended: option.recommended
      }))
  }

  async createPayment(paymentOptionId: string, userId: number): Promise<string> {
    const paymentOption = await this.paymentOptionRepository.findOneByOrFail({
      id: paymentOptionId
    })

    const bonusSumm =
      Number(paymentOption.bonusSumm) > 0
        ? Number(paymentOption.bonusSumm)
        : (paymentOption.bonusPercent && (paymentOption.bonusPercent / 100) * paymentOption.summ) ??
          0

    const payment = await this.paymentRepository.save({
      summ: paymentOption.summ,
      bonusSumm,
      userId
    })

    return payment.id
  }

  async checkPayment(paymentId: string): Promise<void> {
    const payment = await this.paymentRepository.findOneOrFail({ where: { id: paymentId } })
    payment.status = PaymentStatus.SUCCESS
    await payment.save()
    await this.userService.changeBalance(payment.userId, payment.summ, payment.bonusSumm)
  }
}
