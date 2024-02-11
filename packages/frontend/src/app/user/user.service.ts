import { UserBalance, UserTransaction } from '@paulislava/shared/user/user.types'
import { UserApi, userFullRoute, USER_ROUTES } from '@paulislava/shared/user/user.api'

import { apiFetch } from '../utils/api-fetch'

class UserService implements UserApi {
  balance(): Promise<UserBalance> {
    return apiFetch<UserBalance>(userFullRoute(USER_ROUTES.balance()))
  }

  transactions(): Promise<UserTransaction[]> {
    return apiFetch<UserTransaction[]>(userFullRoute(USER_ROUTES.transactions()))
  }
}

export const userService = new UserService()
