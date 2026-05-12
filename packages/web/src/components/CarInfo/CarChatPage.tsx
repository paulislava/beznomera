'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ChatDetails } from '@shared/chat/chat.types';
import { chatService } from '@/services';
import { ChatWindow } from '@/components/Chat/ChatWindow';
import { CarInfoProps } from './CarInfo.types';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
`;

const Header = styled.div`
  padding: 12px 16px;
  font-weight: 600;
  font-size: 15px;
  border-bottom: 1px solid var(--cs-message-input-border-color, #e0e0e0);
`;

export const CarChatPage: React.FC<CarInfoProps> = ({ info, code }) => {
  const [chat, setChat] = useState<ChatDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatService
      .chatByCarCode(code)
      .then(setChat)
      .catch(() => setChat(null))
      .finally(() => setLoading(false));
  }, [code]);

  const title = [info.no, info.brandRaw ?? info.brand?.title, info.model]
    .filter(Boolean)
    .join(' ');

  if (loading) return null;

  return (
    <Wrapper>
      <Header>{title}</Header>
      {chat ? (
        <ChatWindow
          chatId={chat.id}
          initialMessages={chat.messages}
          isOwner={false}
          initialContact={{ contactType: chat.contactType ?? undefined, contactValue: chat.contactValue ?? undefined }}
        />
      ) : (
        <div style={{ padding: 20 }}>Не удалось загрузить чат</div>
      )}
    </Wrapper>
  );
};
