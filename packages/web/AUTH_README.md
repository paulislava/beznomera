# Система аутентификации в Web приложении

## Обзор

Функционал входа был перенесен из frontend в web приложение. Система поддерживает вход через Telegram с использованием `@telegram-apps/sdk-react` и `telegram-login-button`.

## Структура файлов

### Страницы аутентификации
- `/auth` - основная страница входа с telegram-login-button
- `/auth/callback` - страница обработки возврата (упрощена)

### Компоненты и хуки
- `@/components/AuthGuard` - компонент для защиты маршрутов
- `@/components/TelegramLoginButtonWrapper` - обертка для telegram-login-button
- `@/hooks/useAuth` - хук для проверки авторизации

## Использование

### 1. Защита страниц с помощью AuthGuard

```tsx
import { AuthGuard } from '@/components/AuthGuard';

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <div>
        {/* Контент, доступный только авторизованным пользователям */}
      </div>
    </AuthGuard>
  );
}
```

### 2. Использование хука useAuth

```tsx
import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
  const { authorized, loading } = useAuth();

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!authorized) {
    return <div>Требуется авторизация</div>;
  }

  return <div>Авторизованный контент</div>;
}
```

### 3. Проверка авторизации без автоматического редиректа

```tsx
import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
  const { authorized, loading } = useAuth({ redirectToAuth: false });

  // Логика без автоматического редиректа
}
```

## API

### authService

Сервис для работы с аутентификацией:

- `authService.authTelegram(data)` - вход через Telegram
- `authService.authTelegramWebApp(data)` - вход через Telegram Web App
- `authService.checkAuthorized()` - проверка авторизации

### useAuth

Хук возвращает объект с полями:

- `authorized: boolean` - статус авторизации
- `requested: boolean` - была ли выполнена проверка
- `loading: boolean` - состояние загрузки

### AuthGuard

Компонент принимает:

- `children: React.ReactNode` - контент для отображения
- `fallback?: React.ReactNode` - альтернативный контент при отсутствии авторизации

### TelegramLoginButtonWrapper

Компонент-обертка для telegram-login-button:

- `botName: string` - имя бота
- `dataOnauth: (data: TelegramUser) => void` - callback при успешной авторизации

## Настройка

### Переменные окружения

Убедитесь, что в `.env.local` установлены:

```
NEXT_PUBLIC_TELEGRAM_BOT_NAME=your_bot_name
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### Backend URL

По умолчанию используется `/api` для клиентской части. Для продакшена настройте `NEXT_PUBLIC_BACKEND_URL`.

## Зависимости

Система использует следующие пакеты:

- `@telegram-apps/sdk-react` - для работы с Telegram Web App
- `telegram-login-button` - для кнопки входа через Telegram

## Особенности

1. **SSR совместимость** - все компоненты работают с серверным рендерингом
2. **Автоматический редирект** - неавторизованные пользователи перенаправляются на `/auth`
3. **Сохранение пути** - после входа пользователь возвращается на исходную страницу
4. **Telegram Web App поддержка** - автоматическая авторизация в Telegram Web App
5. **Telegram Login Button** - официальная кнопка входа через Telegram
6. **Динамический импорт** - telegram-login-button загружается только на клиенте

## Миграция с Frontend

Основные отличия от frontend версии:

1. Использование Next.js вместо Expo Router
2. CSS-in-JS заменен на Tailwind CSS
3. Упрощенная структура без сложных навигационных стеков
4. Использование telegram-login-button вместо кастомной кнопки
5. Интеграция с @telegram-apps/sdk-react для Web App поддержки

## Технические детали

### Telegram Web App

Система автоматически проверяет наличие данных от Telegram Web App и выполняет авторизацию без дополнительных действий пользователя.

### Telegram Login Button

Используется официальная кнопка входа через Telegram, которая обеспечивает безопасную авторизацию и соответствует дизайн-гайдам Telegram. 