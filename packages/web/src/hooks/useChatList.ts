'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { CHAT_EVENTS, ChatInfo } from '@shared/chat/chat.types';
import { getStoredAuthToken } from '@/utils/auth-storage';

const socketPath = process.env.NEXT_PUBLIC_SOCKET_PATH;

function sortChats(chats: ChatInfo[]): ChatInfo[] {
  return [...chats].sort((a, b) => {
    const aTime = a.lastMessageAt
      ? new Date(a.lastMessageAt).getTime()
      : new Date(a.createdAt).getTime();
    const bTime = b.lastMessageAt
      ? new Date(b.lastMessageAt).getTime()
      : new Date(b.createdAt).getTime();
    return bTime - aTime;
  });
}

export function useChatList(initialChats: ChatInfo[]) {
  const [chats, setChats] = useState<ChatInfo[]>(() => sortChats(initialChats));
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = getStoredAuthToken();
    if (!token) return;

    const socketUrl = socketPath?.startsWith('/') ? '' : socketPath;

    const socket = io(`${socketUrl ?? ''}/chat`, {
      path: '/socket.io',
      auth: { token },
      withCredentials: true
    });

    socketRef.current = socket;

    socket.on(CHAT_EVENTS.CHAT_UPDATE, (updated: ChatInfo) => {
      setChats(prev => {
        const exists = prev.some(c => c.id === updated.id);
        const newList = exists
          ? prev.map(c => (c.id === updated.id ? updated : c))
          : [updated, ...prev];
        return sortChats(newList);
      });
    });

    socket.on(CHAT_EVENTS.CHAT_DELETED, ({ chatId }: { chatId: number }) => {
      setChats(prev => prev.filter(c => c.id !== chatId));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const markRead = useCallback((chatId: number) => {
    socketRef.current?.emit(CHAT_EVENTS.MARK_READ, { chatId });
    setChats(prev => prev.map(c => (c.id === chatId ? { ...c, unreadCount: 0 } : c)));
  }, []);

  const deleteChatForMe = useCallback((chatId: number) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
  }, []);

  const deleteChatForAll = useCallback((chatId: number) => {
    socketRef.current?.emit(CHAT_EVENTS.DELETE_CHAT, { chatId });
    // CHAT_DELETED event from server will remove it from the list
  }, []);

  return { chats, markRead, deleteChatForMe, deleteChatForAll };
}
