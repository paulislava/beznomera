import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import {
  PaymentApi,
  PAYMENT_CONTROLLER_PATH,
  PAYMENT_ROUTES
} from '@paulislava/shared/payment/payment.api'
import { PaymentOptionFull } from '@paulislava/shared/payment/payment.types'

import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../users/user.decorator'
import { RequestUser } from '../users/user.types'

import { PaymentService } from './payment.service'

@Controller(PAYMENT_CONTROLLER_PATH)
@UseGuards(JwtAuthGuard)
export class PaymentController implements PaymentApi {
  constructor(private readonly paymentService: PaymentService) {}

  @Get(PAYMENT_ROUTES.paymentOptions())
  paymentOptions(@CurrentUser() user: RequestUser): Promise<PaymentOptionFull[]> {
    return this.paymentService.getPaymentOptions(user.organizationId)
  }

  @Post(PAYMENT_ROUTES.createPayment())
  createPayment(
    @Body('paymentOptionId') paymentOptionId: string,
    @CurrentUser() user: RequestUser
  ): Promise<string> {
    return this.paymentService.createPayment(paymentOptionId, user.userId)
  }

  @Post(PAYMENT_ROUTES.checkPayment())
  checkPayment(@Body('paymentId') paymentId: string): Promise<void> {
    return this.paymentService.checkPayment(paymentId)
  }
}
