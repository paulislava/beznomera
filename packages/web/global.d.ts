import type { Telegram } from '@shared/auth/auth.api';

declare global {
  interface Window {
    Telegram: Telegram;
  }
}
