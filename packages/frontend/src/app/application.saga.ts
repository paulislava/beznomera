import { all, fork, Effect } from 'redux-saga/effects'

import { authSaga } from './auth/auth.saga'
import { paymentSaga } from './payment/payment.saga'
import { userSaga } from './user/user.saga'

export default function* rootSaga(): Generator<Effect, void, void> {
  yield all([fork(authSaga), fork(userSaga), fork(paymentSaga)])
}
