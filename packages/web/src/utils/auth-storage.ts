'use client';

import { AUTH_COOKIE_NAME, AUTH_STORAGE_KEY } from '@/helpers/constants';

/**
 * Возвращает токен авторизации: сначала из localStorage, при недоступности — из cookie.
 * На сервере (SSR) всегда null — там используется только cookie через getCookie().
 */
export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const fromStorage = localStorage.getItem(AUTH_STORAGE_KEY);
    if (fromStorage) {
      return fromStorage;
    }
  } catch {
    // localStorage недоступен (приватный режим, квота и т.д.)
  }
  return getTokenFromCookie();
}

/**
 * Читает токен из document.cookie (fallback, когда localStorage недоступен).
 */
function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined' || !document.cookie) {
    return null;
  }
  const match = document.cookie.match(
    new RegExp('(?:^|;\\s*)' + encodeURIComponent(AUTH_COOKIE_NAME) + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Сохраняет токен в localStorage (и при ошибке не падаем — тогда будет использоваться cookie с бэкенда).
 */
export function setStoredAuthToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, token);
  } catch {
    // localStorage недоступен — авторизация будет только через cookie
  }
}

/**
 * Удаляет токен из localStorage (при выходе).
 */
export function clearStoredAuthToken(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // игнорируем
  }
}
