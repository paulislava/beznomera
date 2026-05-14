import { TelegramUser } from 'telegram-login-button';

export enum AuthMode {
  TEL = 'tel',
  EMAIL = 'email'
}

export enum OAuthProvider {
  GOOGLE = 'google',
  YANDEX = 'yandex',
  VK = 'vk',
  APPLE = 'apple'
}

export interface AuthStartData {
  identifier: string;
  authMode: AuthMode;
  organizationId?: number;
  allowRegistration?: boolean;
}

export interface AuthCheckData extends AuthStartData {
  code: string;
}

export type AuthTelegramData = TelegramUser & { last_name?: string };

export type AuthTelegramWebAppData = {
  data: string;
};

export interface LinkedAccount {
  provider: OAuthProvider;
  email: string | null;
  displayName: string | null;
}
