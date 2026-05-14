# Features

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
