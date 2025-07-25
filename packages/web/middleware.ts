import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/helpers/constants';
import { decodeUserFromToken } from '@/utils/auth';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const cookie = (await cookies()).get(AUTH_COOKIE_NAME);

  console.log('cookie', cookie);

  if (cookie?.value) {
    // Декодируем JWT токен и получаем пользователя
    const user = decodeUserFromToken(cookie.value);

    if (user) {
      // Добавляем пользователя в request
      (request as any).user = user;

      console.log('user', user);
    }
  }

  return NextResponse.next();
}

// Настраиваем на какие пути применять middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
};
