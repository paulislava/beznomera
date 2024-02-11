import { AuthApi, authFullRoute, AUTH_ROUTES } from '@paulislava/shared/auth/auth.api'
import { AuthCheckData, AuthStartData } from '@paulislava/shared/auth/auth.types'

import { apiFetch } from '../utils/api-fetch'

class AuthService implements AuthApi {
  authStart(data: AuthStartData): Promise<void> {
    return apiFetch(authFullRoute(AUTH_ROUTES.authStart()), {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  authFinish(data: AuthCheckData): Promise<void> {
    return apiFetch(authFullRoute(AUTH_ROUTES.authFinish()), {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  checkAuthorized(...args: any): Promise<void> {
    return apiFetch(authFullRoute(AUTH_ROUTES.checkAuthorized()))
  }

  private post<T = void>(relativeRoute: string, body: unknown): Promise<T> {
    return apiFetch<T>(authFullRoute(relativeRoute), { method: 'POST', body: JSON.stringify(body) })
  }
}

export const authService = new AuthService()
