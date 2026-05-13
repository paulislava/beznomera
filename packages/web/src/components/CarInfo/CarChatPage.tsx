'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ChatDetails } from '@shared/chat/chat.types';
import { chatService } from '@/services';
import { ChatWindow } from '@/components/Chat/ChatWindow';
import { CarInfoProps } from './CarInfo.types';
import { themeable } from '@/themes/utils';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  padding: 10px 16px;
  background: ${themeable('secondaryBackground')};
  border-bottom: 1px solid rgba(128, 128, 128, 0.15);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CarPlate = styled.div`
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: ${themeable('textColor')};
`;

const CarMeta = styled.div`
  font-size: 13px;
  color: ${themeable('textColor')};
  opacity: 0.55;
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

  const brand = [info.brandRaw ?? info.brand?.title, info.model].filter(Boolean).join(' ');

  if (loading) return null;

  return (
    <Wrapper>
      <ChatHeader>
        <CarPlate>{info.no}</CarPlate>
        {brand && <CarMeta>{brand}</CarMeta>}
      </ChatHeader>
      {chat ? (
        <ChatWindow
          chatId={chat.id}
          initialMessages={chat.messages}
          isOwner={false}
          initialContact={{
            contactType: chat.contactType ?? undefined,
            contactValue: chat.contactValue ?? undefined
          }}
        />
      ) : (
        <div style={{ padding: 20 }}>Не удалось загрузить чат</div>
      )}
    </Wrapper>
  );
};
