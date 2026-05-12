'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  ChatContainer,
  ConversationHeader,
  MainContainer,
  Message,
  MessageInput,
  MessageList,
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/cjs/styles.min.css';
import styled from 'styled-components';

import { useChat } from '@/hooks/useChat';
import { ChatContactBody, ChatDetails, ChatMessageInfo, MessageSource } from '@shared/chat/chat.types';
import { themeable } from '@/themes/utils';
import { fileService, chatService } from '@/services';
import { FileFolder } from '@shared/file/file.types';

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;

  /* Override chatscope CSS vars with site theme */
  --cs-conversation-header-background: ${themeable('secondaryBackground')};
  --cs-conversation-header-color: ${themeable('textColor')};

  .cs-main-container,
  .cs-chat-container {
    background: ${themeable('mainBackgroundColor')};
    color: ${themeable('textColor')};
    border: none;
  }

  .cs-message-list {
    background: ${themeable('mainBackgroundColor')};
  }

  .cs-message__content {
    background: ${themeable('secondaryBackground')};
    color: ${themeable('textColor')};
  }

  .cs-message--outgoing .cs-message__content {
    background: ${themeable('primaryColor')};
    color: #fff;
  }

  .cs-message-input {
    background: ${themeable('mainBackgroundColor')};
    border-top: 1px solid ${themeable('secondaryBackground')};
  }

  .cs-message-input__content-editor-wrapper,
  .cs-message-input__content-editor {
    background: ${themeable('input.background')};
    color: ${themeable('textColor')};
  }

  .cs-conversation-header {
    background: ${themeable('secondaryBackground')};
    color: ${themeable('textColor')};
  }
`;

const ContactPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 16px;
  background: ${themeable('secondaryBackground')};
  border-bottom: 1px solid ${themeable('mainBackgroundColor')};
  font-size: 13px;
  color: ${themeable('textColor')};
`;

const ContactRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const ContactSelect = styled.select`
  background: ${themeable('input.background')};
  color: ${themeable('textColor')};
  border: 1px solid ${themeable('primaryColor')};
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 13px;
  cursor: pointer;
`;

const ContactInput = styled.input`
  background: ${themeable('input.background')};
  color: ${themeable('textColor')};
  border: 1px solid ${themeable('primaryColor')};
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 13px;
  flex: 1;
  min-width: 160px;
`;

const AttachButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 8px;
  color: ${themeable('primaryColor')};
  font-size: 20px;
  line-height: 1;
  opacity: 0.8;
  &:hover { opacity: 1; }
`;

const AttachmentImg = styled.img`
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  display: block;
`;

interface ChatWindowProps {
  chatId: number;
  initialMessages: ChatMessageInfo[];
  currentUserId?: number;
  isOwner?: boolean;
  title?: string;
  initialContact?: Pick<ChatDetails, 'contactType' | 'contactValue'>;
}

const CONTACT_OPTIONS = [
  { value: 'none', label: 'Без ответа' },
  { value: 'bot', label: 'Анонимно через бот' },
  { value: 'tel', label: 'По телефону' },
  { value: 'email', label: 'На e-mail' },
];

export function ChatWindow({
  chatId,
  initialMessages,
  currentUserId,
  isOwner = false,
  title,
  initialContact,
}: ChatWindowProps) {
  const { messages, connected, sendMessage } = useChat({ chatId, initialMessages });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [contactType, setContactType] = useState(initialContact?.contactType ?? 'none');
  const [contactValue, setContactValue] = useState(initialContact?.contactValue ?? '');

  const handleContactChange = useCallback(
    async (type: string, value: string) => {
      setContactType(type);
      setContactValue(value);
      const body: ChatContactBody = { contactType: type, contactValue: value || undefined };
      await chatService.updateContact(body, chatId).catch(() => {});
    },
    [chatId],
  );

  const handleSend = useCallback(
    (text: string) => {
      if (text.trim()) sendMessage(text.trim());
    },
    [sendMessage],
  );

  const handleAttach = useCallback(async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const result = await fileService.upload(form, FileFolder.Chat);
      sendMessage('', result.url);
    } catch {
      // ignore upload errors
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [sendMessage]);

  const needsContactValue = contactType === 'tel' || contactType === 'email';

  return (
    <Wrapper>
      {!isOwner && (
        <ContactPanel>
          <ContactRow>
            <span>Способ связи:</span>
            <ContactSelect
              value={contactType}
              onChange={(e) => handleContactChange(e.target.value, contactValue)}
            >
              {CONTACT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </ContactSelect>
            {needsContactValue && (
              <ContactInput
                type={contactType === 'email' ? 'email' : 'tel'}
                placeholder={contactType === 'email' ? 'your@email.com' : '+7...'}
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                onBlur={() => handleContactChange(contactType, contactValue)}
              />
            )}
          </ContactRow>
        </ContactPanel>
      )}

      <MainContainer style={{ flex: 1, minHeight: 0 }}>
        <ChatContainer>
          {title && (
            <ConversationHeader>
              <ConversationHeader.Content userName={title} />
            </ConversationHeader>
          )}
          <MessageList>
            {messages.map((msg) => {
              const direction =
                (msg.source === MessageSource.Sender) !== isOwner
                  ? 'incoming'
                  : 'outgoing';

              if (msg.attachmentUrl) {
                return (
                  <Message
                    key={msg.id}
                    model={{ direction, position: 'single' }}
                  >
                    <Message.CustomContent>
                      <AttachmentImg src={msg.attachmentUrl} alt='attachment' />
                      {msg.text && <div>{msg.text}</div>}
                    </Message.CustomContent>
                  </Message>
                );
              }

              return (
                <Message
                  key={msg.id}
                  model={{
                    message: msg.text,
                    direction,
                    position: 'single',
                    sentTime: msg.createdAt,
                  }}
                />
              );
            })}
          </MessageList>
          <MessageInput
            placeholder={connected ? 'Сообщение...' : 'Соединение...'}
            onSend={handleSend}
            disabled={!connected || uploading}
            attachButton={false}
            sendButton
          >
            <AttachButton
              as='label'
              title='Прикрепить изображение'
              style={{ cursor: 'pointer' }}
            >
              📎
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                style={{ display: 'none' }}
                onChange={handleAttach}
              />
            </AttachButton>
          </MessageInput>
        </ChatContainer>
      </MainContainer>
    </Wrapper>
  );
}
