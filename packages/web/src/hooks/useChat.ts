'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { CHAT_EVENTS, ChatMessageInfo } from '@shared/chat/chat.types';
import { getStoredAuthToken } from '@/utils/auth-storage';

const socketPath = process.env.NEXT_PUBLIC_SOCKET_PATH;

interface UseChatOptions {
  chatId: number;
  initialMessages?: ChatMessageInfo[];
}

export function useChat({ chatId, initialMessages = [] }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessageInfo[]>(initialMessages);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = getStoredAuthToken();

    const socketUrl = socketPath?.startsWith('/') ? '' : socketPath;

    const socket = io(`${socketUrl ?? ''}/chat`, {
      path: '/socket.io',
      auth: token ? { token } : undefined,
      withCredentials: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit(CHAT_EVENTS.JOIN_CHAT, chatId);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on(CHAT_EVENTS.NEW_MESSAGE, (msg: ChatMessageInfo) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socket.emit(CHAT_EVENTS.LEAVE_CHAT, chatId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [chatId]);

  const sendMessage = useCallback(
    (text: string, attachmentUrl?: string) => {
      socketRef.current?.emit(CHAT_EVENTS.SEND_MESSAGE, {
        chatId,
        text,
        attachmentUrl
      });
    },
    [chatId]
  );

  return { messages, connected, sendMessage };
}
