import { Effect, call, put } from 'redux-saga/effects'

import { authActions } from '../auth/auth.slice'

import BackendError from './api-error'
import { FetchError } from './api-fetch'

type Fn<T> = (...params: any[]) => Promise<T>

export function* apiCall<T>(fn: Fn<T>, ...args: any[]): Generator<Effect, T, T> {
  try {
    return yield call(fn, ...args)
  } catch (e) {
    if (e instanceof BackendError || e instanceof FetchError) {
      console.error(e.message)

      if (e.status === 401) {
        console.error('Unauthorized!')
        yield put(authActions.checkAuthorizedFailure())
      } else if (e.status === 403 || e.status === 404) {
        console.error('Access denied!')
      }
    }
    throw e
  }
}
