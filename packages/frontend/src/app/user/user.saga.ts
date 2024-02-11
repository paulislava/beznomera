import { UserBalance, UserTransaction } from '@paulislava/shared/user/user.types'
import { SagaIterator } from 'redux-saga'
import { put, takeLatest } from 'redux-saga/effects'

import { apiCall } from '../utils/api-call'

import { userService } from './user.service'
import { userActions } from './user.slice'

function* fetchBalance(): Generator {
  try {
    const balance = (yield apiCall<UserBalance>(userService.balance)) as UserBalance
    yield put(userActions.fetchBalanceSuccess(balance))
  } catch (e) {
    yield put(userActions.fetchBalanceFailure())
  }
}

function* fetchTransactions(): Generator {
  try {
    const transactions = (yield apiCall(userService.transactions)) as UserTransaction[]
    yield put(userActions.fetchTransactionsSuccess(transactions))
  } catch (e) {
    yield put(userActions.fetchTransactionsFailure())
  }
}

export function* userSaga(): SagaIterator {
  yield takeLatest(userActions.fetchBalance, fetchBalance)
  yield takeLatest(userActions.fetchTransactions, fetchTransactions)
}
