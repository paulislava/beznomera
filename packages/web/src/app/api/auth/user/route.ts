import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Проверяем есть ли пользователь в request (добавленный middleware)
  if (!request.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Возвращаем информацию о пользователе
  return NextResponse.json({
    success: true,
    user: {
      userId: request.user.userId,
      telegramID: request.user.telegramID
    }
  });
}
