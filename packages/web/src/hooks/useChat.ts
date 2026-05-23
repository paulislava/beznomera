'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { CHAT_EVENTS, ChatMessageInfo } from '@shared/chat/chat.types';
import { getStoredAuthToken } from '@/utils/auth-storage';
import { playNotificationSound } from '@/utils/sound';

const socketPath = process.env.NEXT_PUBLIC_SOCKET_PATH;

interface UseChatOptions {
  chatId: number;
  initialMessages?: ChatMessageInfo[];
  isOwner?: boolean;
}

export function useChat({ chatId, initialMessages = [], isOwner = false }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessageInfo[]>(initialMessages);
  const [connected, setConnected] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingEmitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        playNotificationSound();
        return [...prev, msg];
      });
    });

    socket.on(CHAT_EVENTS.MESSAGE_DELETED, ({ messageId }: { messageId: number }) => {
      setMessages(prev => prev.map(m => (m.id === messageId ? { ...m, isDeleted: true } : m)));
    });

    socket.on(CHAT_EVENTS.TYPING, ({ isTyping }: { chatId: number; isTyping: boolean }) => {
      setPartnerTyping(isTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 3000);
      }
    });

    return () => {
      socket.emit(CHAT_EVENTS.LEAVE_CHAT, chatId);
      socket.disconnect();
      socketRef.current = null;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (typingEmitTimeoutRef.current) clearTimeout(typingEmitTimeoutRef.current);
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

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (typingEmitTimeoutRef.current) clearTimeout(typingEmitTimeoutRef.current);
      socketRef.current?.emit(CHAT_EVENTS.TYPING, { chatId, isTyping });
      if (isTyping) {
        typingEmitTimeoutRef.current = setTimeout(() => {
          socketRef.current?.emit(CHAT_EVENTS.TYPING, {
            chatId,
            isTyping: false
          });
        }, 2000);
      }
    },
    [chatId]
  );

  const deleteMessageForAll = useCallback(
    (messageId: number) => {
      socketRef.current?.emit(CHAT_EVENTS.DELETE_MESSAGE, { messageId, chatId });
    },
    [chatId]
  );

  const deleteMessageForMe = useCallback((messageId: number) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  }, []);

  const deleteMessagesForAll = useCallback(
    (messageIds: number[]) => {
      messageIds.forEach(messageId => {
        socketRef.current?.emit(CHAT_EVENTS.DELETE_MESSAGE, { messageId, chatId });
      });
    },
    [chatId]
  );

  const deleteMessagesForMe = useCallback((messageIds: number[]) => {
    setMessages(prev => prev.filter(m => !messageIds.includes(m.id)));
  }, []);

  const deleteChat = useCallback(() => {
    if (!isOwner) return;
    socketRef.current?.emit(CHAT_EVENTS.DELETE_CHAT, { chatId });
  }, [chatId, isOwner]);

  return {
    messages,
    connected,
    sendMessage,
    sendTyping,
    partnerTyping,
    deleteMessageForAll,
    deleteMessageForMe,
    deleteMessagesForAll,
    deleteMessagesForMe,
    deleteChat
  };
}
