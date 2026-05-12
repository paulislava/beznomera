'use client';

import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { ChatDetails, ChatInfo } from '@shared/chat/chat.types';
import { themeable } from '@/themes/utils';
import { chatService } from '@/services';
import { ChatWindow } from './ChatWindow';

const Layout = styled.div`
  height: calc(100vh - 64px);
  display: flex;
  overflow: hidden;
`;

const SidebarPanel = styled.div`
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: ${themeable('secondaryBackground')};
  border-right: 1px solid ${themeable('mainBackgroundColor')};
  overflow-y: auto;
`;

const SidebarHeader = styled.div`
  padding: 16px;
  font-size: 17px;
  font-weight: 600;
  color: ${themeable('textColor')};
  border-bottom: 1px solid ${themeable('mainBackgroundColor')};
  flex-shrink: 0;
`;

const ChatItem = styled.div<{ $active?: boolean }>`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid ${themeable('mainBackgroundColor')};
  background: ${({ $active }) => ($active ? themeable('primaryColor') : 'transparent')};
  transition: background 0.15s;

  &:hover {
    background: ${({ $active }) =>
      $active ? themeable('primaryColor') : themeable('mainBackgroundColor')};
  }
`;

const ChatItemName = styled.div<{ $active?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ $active }) => ($active ? '#fff' : themeable('textColor'))};
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChatItemPreview = styled.div<{ $active?: boolean }>`
  font-size: 12px;
  color: ${({ $active }) => ($active ? 'rgba(255,255,255,0.75)' : themeable('textColor'))};
  opacity: ${({ $active }) => ($active ? 1 : 0.55)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MainArea = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${themeable('textColor')};
  opacity: 0.4;
  font-size: 15px;
  background: ${themeable('mainBackgroundColor')};
`;

interface ChatListProps {
  initialChats: ChatInfo[];
  userId: number;
}

function formatContact(contactType?: string | null, contactValue?: string | null): string {
  if (contactType === 'tel' && contactValue) return `Тел: ${contactValue}`;
  if (contactType === 'email' && contactValue) return `E-mail: ${contactValue}`;
  if (contactType === 'bot') return 'Через бот';
  return 'Анонимно';
}

function previewText(chat: ChatInfo): string {
  const msg = chat.lastMessage;
  if (!msg) return formatContact(chat.contactType, chat.contactValue);
  if (msg.attachmentUrl && !msg.text) return '📎 Изображение';
  return msg.text ?? '';
}

function chatTitle(chat: ChatInfo): string {
  const name = chat.senderName ?? `Чат #${chat.id}`;
  const contact = formatContact(chat.contactType, chat.contactValue);
  return `${name} · ${contact}`;
}

export function ChatList({ initialChats, userId }: ChatListProps) {
  const [selectedId, setSelectedId] = useState<number | null>(initialChats[0]?.id ?? null);
  const [detailsCache, setDetailsCache] = useState<Record<number, ChatDetails>>({});
  const [loading, setLoading] = useState(false);

  const loadChat = useCallback(
    async (chatId: number) => {
      if (detailsCache[chatId]) return;
      setLoading(true);
      try {
        const details = await chatService.chatDetails(chatId);
        setDetailsCache(prev => ({ ...prev, [chatId]: details }));
      } finally {
        setLoading(false);
      }
    },
    [detailsCache]
  );

  useEffect(() => {
    if (selectedId != null) loadChat(selectedId);
  }, [selectedId, loadChat]);

  const selectedChat = initialChats.find(c => c.id === selectedId);
  const selectedDetails = selectedId != null ? detailsCache[selectedId] : undefined;

  return (
    <Layout>
      <SidebarPanel>
        <SidebarHeader>Сообщения</SidebarHeader>
        {initialChats.map(chat => {
          const active = chat.id === selectedId;
          return (
            <ChatItem key={chat.id} $active={active} onClick={() => setSelectedId(chat.id)}>
              <ChatItemName $active={active}>{chat.senderName ?? `Чат #${chat.id}`}</ChatItemName>
              <ChatItemPreview $active={active}>{previewText(chat)}</ChatItemPreview>
            </ChatItem>
          );
        })}
      </SidebarPanel>

      <MainArea>
        {selectedChat ? (
          <ChatWindow
            chatId={selectedChat.id}
            initialMessages={selectedDetails?.messages ?? []}
            currentUserId={userId}
            isOwner
            title={chatTitle(selectedChat)}
          />
        ) : (
          <EmptyState>Выберите чат</EmptyState>
        )}
        {loading && !selectedDetails && (
          <EmptyState style={{ position: 'absolute', inset: 0, background: 'transparent' }}>
            Загрузка...
          </EmptyState>
        )}
      </MainArea>
    </Layout>
  );
}
