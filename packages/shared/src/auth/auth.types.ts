import { TelegramUser } from 'telegram-login-button';

export enum AuthMode {
  TEL = 'tel',
  EMAIL = 'email'
}

export interface AuthStartData {
  identifier: string;
  authMode: AuthMode;
  organizationId?: number;
}

export interface AuthCheckData extends AuthStartData {
  code: string;
}

export type AuthTelegramData = TelegramUser;

export type AuthTelegramWebAppData = {
  data: string;
};
