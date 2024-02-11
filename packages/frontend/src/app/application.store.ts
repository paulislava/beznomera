import { configureStore } from '@reduxjs/toolkit'
import { useEffect } from 'react'
import { useStore, useSelector, useDispatch } from 'react-redux'
import { AnyAction, combineReducers, Store } from 'redux'
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga'

import rootSaga from './application.saga'
import { authActions, authReducer } from './auth/auth.slice'
import { paymentReducer } from './payment/payment.slice'
import { userReducer } from './user/user.slice'

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  payment: paymentReducer
})

export type AppStore = ReturnType<typeof rootReducer>

export default rootReducer

export function createApplicationStore(): Store<AppStore> {
  const sagaMiddleware: SagaMiddleware = createSagaMiddleware()
  const store: Store<AppStore> = configureStore({
    reducer: rootReducer,
    middleware: [sagaMiddleware]
  })
  sagaMiddleware.run(rootSaga)
  return store
}

export const applicationStore = createApplicationStore()

export const useAppStore = (): Store<AppStore, AnyAction> => {
  return useStore<AppStore>()
}

export const useAppSelector = <Selected = unknown>(
  selector: (state: AppStore) => Selected
): Selected => {
  return useSelector<AppStore, Selected>(selector)
}

export const useAuthorized = (): boolean => {
  const authorized = useAppSelector(state => state.auth.authorized)
  const needAuth = useAppSelector(state => state.auth.needAuth)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!authorized && !needAuth) {
      dispatch(authActions.checkAuthorizedFetch())
    }
  }, [authorized, dispatch, needAuth])

  return authorized
}
