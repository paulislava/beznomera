import { APIRoutes } from '../api-routes'

import { PaymentOptionFull } from './payment.types'

export interface PaymentApi {
  paymentOptions(...args: any[]): Promise<PaymentOptionFull[]>
  createPayment(paymentOptionId: string, ...args: any[]): Promise<string>
  checkPayment(paymentId: string): Promise<void>
}

export const PAYMENT_CONTROLLER_PATH: string = '/payments'

export const PAYMENT_ROUTES: APIRoutes<PaymentApi> = {
  paymentOptions: () => '/options',
  createPayment: () => '/create',
  checkPayment: () => '/check'
}

export const paymentFullRoute = (route: string): string => `${PAYMENT_CONTROLLER_PATH}${route}`
