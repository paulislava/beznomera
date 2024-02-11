import { SagaIterator } from 'redux-saga'
import { PayloadAction } from '@reduxjs/toolkit'
import { AuthCheckData, AuthStartData } from '@paulislava/shared/auth/auth.types'
import { call, put, takeLatest } from 'redux-saga/effects'

import { apiCall } from '../utils/api-call'
import BackendError from '../utils/api-error'

import { authActions } from './auth.slice'
import { authService } from './auth.service'

import { errorMessages } from '~/languages/ru'

function* authStart(action: PayloadAction<AuthStartData>): Generator {
  try {
    yield apiCall(authService.authStart, action.payload)
    yield put(authActions.successStartAuth())
  } catch (e) {
    console.error(e)
    const data = e instanceof BackendError ? e.data : null

    if (data) {
      alert(errorMessages[data.code] ?? data.code)
    }

    yield put(authActions.failureStartAuth(data ?? String((e as Error).message)))
  }
}

function* authFinish(action: PayloadAction<AuthCheckData>): Generator {
  try {
    yield apiCall(authService.authFinish, action.payload)
    yield put(authActions.successFinishAuth())
  } catch (e) {
    console.error(e)
    const data = e instanceof BackendError ? e.data : null

    if (data) {
      alert(errorMessages[data.code] ?? data.message)
    }

    yield put(authActions.failureFinishAuth(data ?? String((e as Error).message)))
  }
}

function* checkAuthorized(): Generator {
  try {
    yield call(authService.checkAuthorized)
    yield put(authActions.checkAuthorizedSuccess())
  } catch (e) {
    yield put(authActions.checkAuthorizedFailure())
  }
}

export function* authSaga(): SagaIterator {
  yield takeLatest(authActions.fetchStartAuth, authStart)
  yield takeLatest(authActions.fetchFinishAuth, authFinish)
  yield takeLatest(authActions.checkAuthorizedFetch, checkAuthorized)
}
