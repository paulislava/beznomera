import { AUTH_CONTROLLER_PATH, AUTH_ROUTES, AuthApi } from '../../shared/src/auth/auth.api';
import { AuthStartData, AuthCheckData } from '../../shared/src/auth/auth.types';
import { TelegramUser } from 'telegram-login-button';
import { ApiService } from './service';

export class AuthService extends ApiService<AuthApi> implements AuthApi {
  authStart(data: AuthStartData): Promise<void> {
    throw new Error('Method not implemented.');
  }
  authFinish(data: AuthCheckData, ...args: any): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async authTelegram(body: TelegramUser): Promise<void> {
    await this.post('authTelegram', body);
  }
  async checkAuthorized(): Promise<void> {
    await this.get('checkAuthorized');
  }
}

export const authService = new AuthService(AUTH_ROUTES, AUTH_CONTROLLER_PATH);
