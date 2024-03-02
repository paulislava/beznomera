import { APIRoutes } from '../api-routes';

import { AuthCheckData, AuthStartData } from './auth.types';

export interface AuthApi {
  authStart(data: AuthStartData): Promise<void>;
  authFinish(data: AuthCheckData, ...args: any): Promise<void>;
  checkAuthorized(...args: any): Promise<void>;
}

export const AUTH_CONTROLLER_PATH = '/auth';

export const AUTH_ROUTES: APIRoutes<AuthApi> = {
  authStart: () => '/start',
  authFinish: () => '/finish',
  checkAuthorized: () => '/check'
};

export const authFullRoute = (route: string): string => `${AUTH_CONTROLLER_PATH}${route}`;
