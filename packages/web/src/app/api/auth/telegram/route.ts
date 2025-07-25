import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/utils/api-service';
import { AUTH_COOKIE_NAME } from '@/helpers/constants';
import { AUTH_TOKEN_EXPIRATION_TIME } from '@shared/auth/auth.api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Проксируем запрос на backend
    const response = await fetch(`${BACKEND_URL}/auth/telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Authentication failed' },
        { status: response.status }
      );
    }

    // Получаем куки из ответа backend
    const token = await response.text();

    if (token) {
      // Создаем ответ с кукой
      const nextResponse = NextResponse.json({ success: true });

      // Устанавливаем куку из backend
      nextResponse.cookies.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: new Date(Date.now() + AUTH_TOKEN_EXPIRATION_TIME)
      });

      return nextResponse;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auth proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
