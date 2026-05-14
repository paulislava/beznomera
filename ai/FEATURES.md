# Features

## OAuth авторизация + профиль пользователя

**Провайдеры:** Google, Yandex, VK, Apple + Email OTP (для новых пользователей)

**Shared:**
- `packages/shared/src/auth/auth.types.ts` — `OAuthProvider` enum, `LinkedAccount` interface, `allowRegistration` в `AuthStartData`
- `packages/shared/src/auth/auth.api.ts` — `getLinkedAccounts`, `unlinkProvider` роуты
- `packages/shared/src/user/user.types.ts` — `UserProfile` дополнен `email`, `linkedAccounts`, `avatarUrl`; `UserProfileUpdate`
- `packages/shared/src/user/user.api.ts` — `me`, `getProfile(id)`, `updateMe`, `deleteAvatar` роуты

**Backend entities:**
- `packages/backend/src/app/entities/user/user-oauth.entity.ts` — связь пользователя с OAuth провайдером; уникальный индекс `[provider, providerUserId]`
- `packages/backend/src/app/entities/user/user-core.entity.ts` — добавлено поле `avatarUrl`

**Backend config:**
- `packages/backend/src/app/config/config.schema.ts` — `OAuthProviderConfig`, `AppleOAuthConfig`, `OAuthConfig`; секция `oauth?` в `ApplicationConfig` (опциональна)
- `packages/backend/config.example.yaml` — пример секции `oauth:`

**Backend auth (OAuth стратегии + контроллер):**
- `packages/backend/src/app/auth/strategies/google.strategy.ts`
- `packages/backend/src/app/auth/strategies/yandex.strategy.ts`
- `packages/backend/src/app/auth/strategies/vk.strategy.ts`
- `packages/backend/src/app/auth/strategies/apple.strategy.ts`
- `packages/backend/src/app/auth/auth.service.ts` — `authOAuth`, `unlinkOAuth`, `getLinkedAccounts`; `authStart` с `allowRegistration`
- `packages/backend/src/app/auth/auth.controller.ts` — `GET /auth/{provider}`, `GET /auth/{provider}/callback`, `GET /auth/linked`, `DELETE /auth/linked/:provider`
- `packages/backend/src/app/auth/auth.module.ts` — `PassportModule`, стратегии, `UserOAuth` entity

**Backend user profile:**
- `packages/backend/src/app/users/user.service.ts` — `getProfile`, `updateProfile`, `uploadAvatar` (S3), `deleteAvatar`
- `packages/backend/src/app/users/user.controller.ts` — `GET /user/me`, `GET /user/profile/:id`, `PATCH /user/me`, `POST /user/me/avatar`, `DELETE /user/me/avatar`

**Frontend:**
- `packages/web/src/app/auth/page.tsx` — добавлены Email OTP форма + social кнопки (Google, Яндекс, VK, Apple)
- `packages/web/src/app/profile/page.tsx` — server component: `withUser` + `createApi(token)` + `api.user.getProfile(user.userId)`
- `packages/web/src/app/profile/ProfileClient.tsx` — client component: аватар, форма личных данных, контакты, список привязанных аккаунтов

**Key behaviors:**
- OAuth callback детектирует режим linking по JWT cookie: если пользователь уже залогинен — привязывает провайдер к аккаунту, иначе логинит/регистрирует
- `authStart` с `allowRegistration: true` создаёт `UserDraft` для нового пользователя
- Apple требует `clientId` (Service ID), `teamId`, `keyId`, `privateKey` (.p8 контент)
- Аватары хранятся в S3; если S3 не настроен — метод выбрасывает ошибку
- Серверная страница профиля загружает данные через `/user/profile/:id` (ID в URL для кэширования)



## Telegram-style Chat UX

**Files:**
- `packages/shared/src/chat/chat.types.ts` — `MessageType`, `CHAT_EVENTS`, `unreadCount`, `lastMessageAt`
- `packages/shared/src/chat/chat.api.ts` — `markAsRead`, `deleteChat`, `deleteMessage` routes
- `packages/backend/src/app/entities/chat/chat.entity.ts` — `recieverReadAt`, `anonymousNumber`
- `packages/backend/src/app/entities/chat/message.entity.ts` — `type`, `isDeleted`
- `packages/backend/src/app/migrations/1748000000000-ChatAnonymousNumberAndUnread.ts`
- `packages/backend/src/app/migrations/1748000001000-ChatMessageTypeDeleted.ts`
- `packages/backend/src/app/chat/chat.service.ts` — markAsRead, deleteMessage, deleteChat, createCallSystemMessage, unreadCount, anonymousNumber
- `packages/backend/src/app/chat/chat.gateway.ts` — typing, mark_read, delete_message, delete_chat WS handlers; personal user rooms
- `packages/backend/src/app/chat/chat.controller.ts` — REST: markAsRead, deleteMessage, deleteChat
- `packages/backend/src/app/car/car.service.ts` — call() triggers createCallSystemMessage
- `packages/backend/src/app/car/car.controller.ts` — call() accepts optional auth (OptionalJwtAuthGuard)
- `packages/web/src/utils/sound.ts` — Web Audio API notification sound
- `packages/web/src/hooks/useChat.ts` — sendTyping, partnerTyping, deleteMessage, deleteChat, MESSAGE_DELETED handler, sound on new message
- `packages/web/src/hooks/useChatList.ts` — realtime chat list via WS (CHAT_UPDATE, CHAT_DELETED), sortByLastMessage
- `packages/web/src/components/Chat/ChatList.tsx` — uses useChatList, unread badges, markRead on select
- `packages/web/src/components/Chat/ChatWindow.tsx` — typing indicator, system messages (call/system type), deleted message rendering, delete button on hover

**Key behaviors:**
- Anonymous chats get sequential numbers per owner: "Аноним #1", "Аноним #2"
- Unread badge shows count; clears when owner opens the chat (MARK_READ via WS)
- "Позвать водителя" creates a system message (type=call) visible in the chat
- Typing indicator: sender emits TYPING, auto-stops after 2s of no input; recipient auto-clears after 3s
- Delete message: soft-delete (`isDeleted=true`), shown as "Сообщение удалено" to both parties
- Delete chat: hard-delete, both participants receive CHAT_DELETED event
- Chat list updates in realtime via CHAT_UPDATE emitted to owner's personal WS room (`user:{userId}`)
- Chat list sorted by `lastMessageAt DESC`
