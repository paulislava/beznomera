# Middleware для аутентификации

Этот middleware автоматически декодирует JWT токен из cookie и добавляет объект `user` в request.

## Как это работает

1. **Middleware** (`middleware.ts`) - автоматически декодирует JWT токен из cookie `auth` и добавляет объект `user` в `NextRequest`
2. **Утилиты** (`src/utils/auth.ts`) - функции для работы с JWT токенами
3. **API Route** (`src/app/api/auth/user/route.ts`) - эндпоинт для получения информации о пользователе
4. **Хук** (`src/hooks/useUser.ts`) - React хук для получения пользователя в компонентах

## Структура

### Middleware
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);
  
  if (cookie?.value) {
    const user = decodeUserFromToken(cookie.value);
    if (user) {
      (request as any).user = user;
    }
  }
  
  return NextResponse.next();
}
```

### Утилиты
```typescript
// src/utils/auth.ts
export function decodeUserFromToken(token: string): RequestUser | null
export function isValidToken(token: string): boolean
```

### API Route
```typescript
// src/app/api/auth/user/route.ts
export async function GET(request: NextRequest) {
  if (!request.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return NextResponse.json({
    success: true,
    user: request.user,
  });
}
```

### Хук
```typescript
// src/hooks/useUser.ts
export function useUser(): UseUserResult {
  // Возвращает { user, loading, error }
}
```

## Использование

### В API Routes
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  if (!request.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // request.user содержит { userId: number, telegramID: number }
  return NextResponse.json({ user: request.user });
}
```

### В React компонентах
```typescript
import { useUser } from '@/hooks/useUser';

function MyComponent() {
  const { user, loading, error } = useUser();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return <div>Welcome, user {user.userId}!</div>;
}
```

## Конфигурация

### Переменные окружения
```env
JWT_SECRET=your_jwt_secret_here
```

### Matcher конфигурация
Middleware применяется ко всем путям, кроме:
- `/api/*` - API routes
- `/_next/static/*` - статические файлы
- `/_next/image/*` - оптимизированные изображения
- `/favicon.ico` - иконка сайта

## Типы

### RequestUser
```typescript
interface RequestUser {
  userId: number;
  telegramID: number;
}
```

### Расширение NextRequest
```typescript
declare module 'next/server' {
  interface NextRequest {
    user?: RequestUser;
  }
}
```

## Безопасность

- JWT токен проверяется на валидность
- Проверяется наличие `telegramID` в payload
- Невалидные токены игнорируются без ошибок
- Секрет берется из переменных окружения

## Зависимости

- `jsonwebtoken` - для декодирования JWT токенов
- `@types/jsonwebtoken` - типы для TypeScript 