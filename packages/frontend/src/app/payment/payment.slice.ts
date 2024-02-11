import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PaymentOptionFull } from '@paulislava/shared/payment/payment.types'

export interface PaymentStore {
  pending: boolean
  options: PaymentOptionFull[] | null
  paymentUrl: string | null
  paymentSuccess: boolean | null
}

const initialState: PaymentStore = {
  pending: false,
  options: null,
  paymentUrl: null,
  paymentSuccess: null
}

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    fetchOptions(state: PaymentStore) {
      state.pending = true
      state.paymentSuccess = null
      state.paymentUrl = null
    },
    fetchOptionsSuccess(state: PaymentStore, action: PayloadAction<PaymentOptionFull[]>) {
      state.pending = false
      state.options = action.payload
    },
    fetchOptionsFailure(state: PaymentStore) {
      state.pending = false
      alert('Ошибка при загрузке вариантов оплаты')
    },

    createPayment(state: PaymentStore, action: PayloadAction<string>) {
      state.pending = true
      state.paymentUrl = null
      state.paymentSuccess = null
    },
    createPaymentSuccess(state: PaymentStore, action: PayloadAction<string>) {
      state.paymentUrl = action.payload
      state.pending = false
    },
    createPaymentFailure(state: PaymentStore) {
      state.pending = false
      alert('Ошибка при инициализации платежа')
    },

    checkPayment(state: PaymentStore, action: PayloadAction<string>) {
      state.pending = true
      state.paymentUrl = null
    },
    checkPaymentSuccess(state: PaymentStore) {
      state.paymentSuccess = true
      state.pending = false
    },
    checkPaymentFailure(state: PaymentStore) {
      state.paymentSuccess = false
      state.pending = false
    }
  }
})

export const paymentActions = paymentSlice.actions
export const paymentReducer = paymentSlice.reducer
