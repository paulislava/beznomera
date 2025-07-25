// Ручка проксирования на authService.check с cookie auth

import { NextRequest, NextResponse } from 'next/server';
import { createApi } from '@/services';
import { AUTH_COOKIE_NAME } from '@/helpers/constants';

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);

  if (!cookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const api = createApi(cookie.value);

  try {
    await api.auth.checkAuthorized();
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
