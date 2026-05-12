'use client';

import React, { useState } from 'react';
import {
  Conversation,
  ConversationList,
  MainContainer,
  Sidebar
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import styled from 'styled-components';

import { ChatInfo, ChatMessageInfo } from '@shared/chat/chat.types';
import { themeable } from '@/themes/utils';
import { ChatWindow } from './ChatWindow';

const Wrapper = styled.div`
  height: calc(100vh - 64px);
  display: flex;

  --cs-conversation-list-background: ${themeable('secondaryBackground')};
  --cs-conversation-background: ${themeable('secondaryBackground')};
  --cs-conversation-color: ${themeable('textColor')};
  --cs-sidebar-background: ${themeable('secondaryBackground')};

  .cs-sidebar {
    background: ${themeable('secondaryBackground')};
    border-right: 1px solid ${themeable('mainBackgroundColor')};
  }

  .cs-conversation-list {
    background: ${themeable('secondaryBackground')};
  }

  .cs-conversation {
    background: ${themeable('secondaryBackground')};
    color: ${themeable('textColor')};

    &:hover,
    &[data-active='true'] {
      background: ${themeable('mainBackgroundColor')};
    }
  }

  .cs-conversation__name {
    color: ${themeable('textColor')};
  }

  .cs-conversation__info {
    color: ${themeable('textColor')};
    opacity: 0.6;
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${themeable('textColor')};
  opacity: 0.5;
  font-size: 15px;
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

function lastMessageText(msg?: ChatMessageInfo): string {
  if (!msg) return '';
  if (msg.attachmentUrl && !msg.text) return '📎 Изображение';
  return msg.text ?? '';
}

export function ChatList({ initialChats, userId }: ChatListProps) {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(initialChats[0]?.id ?? null);
  const selectedChat = initialChats.find(c => c.id === selectedChatId);
  const initialMessages: ChatMessageInfo[] = [];

  return (
    <Wrapper>
      <MainContainer style={{ width: '100%' }}>
        <Sidebar position='left' style={{ minWidth: '240px', maxWidth: '300px' }}>
          <ConversationList>
            {initialChats.map(chat => (
              <Conversation
                key={chat.id}
                name={chat.senderName ?? `Чат #${chat.id}`}
                info={
                  chat.lastMessage
                    ? lastMessageText(chat.lastMessage)
                    : formatContact(chat.contactType, chat.contactValue)
                }
                active={chat.id === selectedChatId}
                onClick={() => setSelectedChatId(chat.id)}
              />
            ))}
          </ConversationList>
        </Sidebar>

        {selectedChat ? (
          <ChatWindow
            chatId={selectedChat.id}
            initialMessages={initialMessages}
            currentUserId={userId}
            isOwner
            title={
              selectedChat.senderName ??
              `Чат #${selectedChat.id}` +
                (selectedChat.contactType
                  ? ' · ' + formatContact(selectedChat.contactType, selectedChat.contactValue)
                  : '')
            }
          />
        ) : (
          <EmptyState>Выберите чат</EmptyState>
        )}
      </MainContainer>
    </Wrapper>
  );
}
