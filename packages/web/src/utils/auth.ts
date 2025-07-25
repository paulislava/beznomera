import jwt from 'jsonwebtoken';
import { RequestUser } from '../../../shared/src/user/user.types';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/helpers/constants';

// JWT секрет должен быть таким же как в backend
const JWT_SECRET = process.env.JWT_SECRET || 'MY_SECRET';

/**
 * Декодирует JWT токен и возвращает информацию о пользователе
 */
export function decodeUserFromToken(token: string): RequestUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as RequestUser;

    // Проверяем что у пользователя есть telegramID (как в backend стратегии)
    if (decoded && decoded.telegramID) {
      return decoded;
    }

    return null;
  } catch (error) {
    console.warn('Invalid JWT token:', error);
    return null;
  }
}

/**
 * Проверяет валидность JWT токена
 */
export function isValidToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export const getUserFromRequest = async () => {
  const cookieStore = await cookies();

  const cookie = cookieStore.get(AUTH_COOKIE_NAME);

  if (cookie?.value) {
    return decodeUserFromToken(cookie.value);
  }

  return null;
};
