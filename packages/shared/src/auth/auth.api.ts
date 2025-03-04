import { APIRoutes, apiInfo } from '../api-routes';

import { AuthCheckData, AuthStartData, AuthTelegramData } from './auth.types';

export interface AuthApi {
  authStart(data: AuthStartData): Promise<void>;
  authFinish(data: AuthCheckData, ...args: any): Promise<void>;
  authTelegram(data: AuthTelegramData, ...args: any): Promise<void>;
  authTelegramWebApp(data: string, ...args: any): Promise<void>;
  checkAuthorized(...args: any): Promise<void>;
}

const AUTH_ROUTES: APIRoutes<AuthApi> = {
  authStart: 'start',
  authFinish: 'finish',
  authTelegram: { method: 'POST', path: 'telegram' },
  authTelegramWebApp: { method: 'POST', path: 'telegram-web-app' },
  checkAuthorized: 'check'
};

const AUTH_API = apiInfo(AUTH_ROUTES, 'auth');
export default AUTH_API;
