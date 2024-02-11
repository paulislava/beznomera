import { PayloadAction } from '@reduxjs/toolkit'
import { PaymentOptionFull } from '@paulislava/shared/payment/payment.types'
import { SagaIterator } from 'redux-saga'
import { put, takeLatest } from 'redux-saga/effects'

import { apiCall } from '../utils/api-call'

import { paymentService } from './payment.service'
import { paymentActions } from './payment.slice'

function* fetchOptions(): Generator {
  try {
    const options = (yield apiCall(paymentService.paymentOptions)) as PaymentOptionFull[]
    yield put(paymentActions.fetchOptionsSuccess(options))
  } catch (e) {
    yield put(paymentActions.fetchOptionsFailure())
  }
}

function* createPayment(action: PayloadAction<string>): Generator {
  try {
    const paymentUrl = (yield apiCall(paymentService.createPayment, action.payload)) as string
    yield put(paymentActions.createPaymentSuccess(paymentUrl))
  } catch (e) {
    yield put(paymentActions.createPaymentFailure())
  }
}

function* checkPayment(action: PayloadAction<string>): Generator {
  try {
    yield apiCall(paymentService.checkPayment, action.payload)
    yield put(paymentActions.checkPaymentSuccess())
  } catch (e) {
    yield put(paymentActions.checkPaymentFailure())
  }
}

export function* paymentSaga(): SagaIterator {
  yield takeLatest(paymentActions.fetchOptions, fetchOptions)
  yield takeLatest(paymentActions.createPayment, createPayment)
  yield takeLatest(paymentActions.checkPayment, checkPayment)
}
