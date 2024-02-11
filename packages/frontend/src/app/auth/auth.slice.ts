import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthCheckData, AuthMode, AuthStartData } from '@paulislava/shared/auth/auth.types'
import { ResponseWithCode } from '@paulislava/shared/responses'
import browserHistory from 'next/router'

import { LOGIN_REDIRECT_PARAM } from '../application.constants'
import { appRoutes } from '../application.routes'

import { goAuth } from './auth.utils'

export interface AuthStore {
  pending: boolean
  authMode: AuthMode | null
  identifier: string | null
  codeSended: boolean
  authorized: boolean
  needAuth: boolean
  error: string | ResponseWithCode | null
}

const initialState: AuthStore = {
  pending: false,
  authMode: null,
  identifier: null,
  codeSended: false,
  authorized: false,
  needAuth: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    checkAuth(state: AuthStore) {
      state.pending = true
    },
    successAuth(state: AuthStore) {
      state.pending = false
      state.authorized = true
    },
    failureAuth(state: AuthStore) {
      state.pending = false
      state.authorized = false
    },

    fetchStartAuth(state: AuthStore, action: PayloadAction<AuthStartData>) {
      state.pending = true
      state.authorized = false
      state.authMode = action.payload.authMode
      state.identifier = action.payload.identifier
    },
    successStartAuth(state: AuthStore) {
      state.pending = false
      state.codeSended = true
    },
    failureStartAuth(state: AuthStore, action: PayloadAction<string | ResponseWithCode | null>) {
      state.pending = false
      state.error = action.payload
    },

    fetchFinishAuth(state: AuthStore, action: PayloadAction<AuthCheckData>) {
      state.pending = true
    },
    successFinishAuth(state: AuthStore) {
      state.pending = false
      state.authorized = true
    },
    failureFinishAuth(state: AuthStore, action: PayloadAction<string | ResponseWithCode | null>) {
      state.pending = false
      state.error = action.payload
    },

    checkAuthorizedFetch(state: AuthStore) {},
    checkAuthorizedSuccess(state: AuthStore) {
      state.authorized = true
      state.needAuth = false
    },
    checkAuthorizedFailure(state: AuthStore) {
      state.authorized = false
      goAuth()
    },
    goAuth(state: AuthStore) {
      state.needAuth = false
      goAuth()
    }
  }
})

export const authActions = authSlice.actions
export const authReducer = authSlice.reducer
