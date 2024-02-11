import { PaymentApi, paymentFullRoute, PAYMENT_ROUTES } from '@paulislava/shared/payment/payment.api'
import { PaymentOptionFull } from '@paulislava/shared/payment/payment.types'

import { apiFetch } from '../utils/api-fetch'

class PaymentService implements PaymentApi {
  paymentOptions(): Promise<PaymentOptionFull[]> {
    return apiFetch<PaymentOptionFull[]>(paymentFullRoute(PAYMENT_ROUTES.paymentOptions()))
  }

  createPayment(paymentOptionId: string): Promise<string> {
    return apiFetch<string>(paymentFullRoute(PAYMENT_ROUTES.createPayment()), {
      body: JSON.stringify({ paymentOptionId }),
      method: 'POST'
    })
  }

  checkPayment(paymentId: string): Promise<void> {
    return apiFetch(paymentFullRoute(PAYMENT_ROUTES.checkPayment()), {
      body: JSON.stringify({ paymentId }),
      method: 'POST'
    })
  }
}

export const paymentService = new PaymentService()
