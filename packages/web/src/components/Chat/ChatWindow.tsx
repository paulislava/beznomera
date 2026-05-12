'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { useChat } from '@/hooks/useChat';
import {
  ChatContactBody,
  ChatDetails,
  ChatMessageInfo,
  MessageSource
} from '@shared/chat/chat.types';
import { themeable } from '@/themes/utils';
import { chatService, fileService } from '@/services';
import { FileFolder } from '@shared/file/file.types';

// ─── Layout ─────────────────────────────────────────────────────────────────────────────

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${themeable('mainBackgroundColor')};
  overflow: hidden;
`;

// ─── Header ─────────────────────────────────────────────────────────────────────────────

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  min-height: 52px;
  flex-shrink: 0;
  background: ${themeable('secondaryBackground')};
  border-bottom: 1px solid rgba(128, 128, 128, 0.15);
`;

const HeaderTitle = styled.div`
  flex: 1;
  min-width: 0;
`;

const HeaderName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${themeable('textColor')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const HeaderStatus = styled.div<{ $online: boolean }>`
  font-size: 12px;
  color: ${({ $online }) => ($online ? '#4cd964' : themeable('textColor'))};
  opacity: ${({ $online }) => ($online ? 1 : 0.45)};
  margin-top: 1px;
`;

// ─── Message list ─────────────────────────────────────────────────────────────────────

const MsgList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const MsgRow = styled.div<{ $out: boolean }>`
  display: flex;
  justify-content: ${({ $out }) => ($out ? 'flex-end' : 'flex-start')};
`;

const Bubble = styled.div<{ $out: boolean }>`
  max-width: 75%;
  padding: 8px 12px 6px;
  border-radius: ${({ $out }) => ($out ? '18px 18px 4px 18px' : '18px 18px 18px 4px')};
  background: ${({ $out }) =>
    $out ? themeable('primaryColor') : themeable('secondaryBackground')};
  color: ${({ $out }) => ($out ? '#fff' : themeable('textColor'))};
  font-size: 14px;
  line-height: 1.45;
  word-break: break-word;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.14);
  position: relative;
`;

const BubbleText = styled.span`
  display: block;
  padding-right: 44px;
`;

const BubbleTime = styled.span<{ $out: boolean }>`
  font-size: 11px;
  opacity: 0.65;
  position: absolute;
  bottom: 6px;
  right: 10px;
  color: ${({ $out }) => ($out ? 'rgba(255,255,255,0.85)' : themeable('textColor'))};
`;

const AttachImg = styled.img`
  max-width: 220px;
  max-height: 220px;
  border-radius: 12px;
  display: block;
  margin-bottom: 2px;
`;

// ─── Contact panel ───────────────────────────────────────────────────────────────────────

const ContactPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: ${themeable('secondaryBackground')};
  border-bottom: 1px solid rgba(128, 128, 128, 0.12);
  font-size: 13px;
  color: ${themeable('textColor')};
  flex-shrink: 0;
`;

const ContactSelect = styled.select`
  background: ${themeable('mainBackgroundColor')};
  color: ${themeable('textColor')};
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 13px;
  cursor: pointer;
`;

const ContactInput = styled.input`
  background: ${themeable('mainBackgroundColor')};
  color: ${themeable('textColor')};
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 13px;
  flex: 1;
  min-width: 140px;
  &::placeholder {
    opacity: 0.45;
  }
`;

// ─── Input area ─────────────────────────────────────────────────────────────────────────

const InputArea = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 6px;
  padding: 8px 10px;
  background: ${themeable('secondaryBackground')};
  border-top: 1px solid rgba(128, 128, 128, 0.12);
  flex-shrink: 0;
`;

const TextInput = styled.textarea`
  flex: 1;
  border: none;
  outline: none;
  background: ${themeable('mainBackgroundColor')};
  color: ${themeable('textColor')};
  font-size: 14px;
  line-height: 1.45;
  padding: 10px 14px;
  border-radius: 22px;
  resize: none;
  max-height: 120px;
  min-height: 42px;
  font-family: inherit;

  &::placeholder {
    opacity: 0.4;
  }
`;

const RoundBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: ${themeable('primaryColor')};
  font-size: 22px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;

  &:hover {
    background: ${themeable('mainBackgroundColor')};
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;

const SendBtn = styled(RoundBtn)<{ $active: boolean }>`
  background: ${({ $active }) => ($active ? themeable('primaryColor') : 'transparent')};
  color: ${({ $active }) => ($active ? '#fff' : themeable('primaryColor'))};

  &:hover {
    background: ${({ $active }) =>
      $active ? themeable('primaryColor') : themeable('mainBackgroundColor')};
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

const CONTACT_OPTIONS = [
  { value: 'none', label: 'Без ответа' },
  { value: 'bot', label: 'Анонимно через бот' },
  { value: 'tel', label: 'По телефону' },
  { value: 'email', label: 'На e-mail' }
];

interface ChatWindowProps {
  chatId: number;
  initialMessages: ChatMessageInfo[];
  currentUserId?: number;
  isOwner?: boolean;
  title?: string;
  initialContact?: Pick<ChatDetails, 'contactType' | 'contactValue'>;
}

// ─── Component ─────────────────────────────────────────────────────────────────────────────

export function ChatWindow({
  chatId,
  initialMessages,
  isOwner = false,
  title,
  initialContact
}: ChatWindowProps) {
  const { messages, connected, sendMessage } = useChat({ chatId, initialMessages });
  const listRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [contactType, setContactType] = useState(initialContact?.contactType ?? 'none');
  const [contactValue, setContactValue] = useState(initialContact?.contactValue ?? '');

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleContactChange = useCallback(
    async (type: string, value: string) => {
      setContactType(type);
      setContactValue(value);
      const body: ChatContactBody = { contactType: type, contactValue: value || undefined };
      await chatService.updateContact(body, chatId).catch(() => {});
    },
    [chatId]
  );

  const handleSend = useCallback(() => {
    const t = text.trim();
    if (!t || !connected) return;
    sendMessage(t);
    setText('');
    if (textRef.current) {
      textRef.current.style.height = 'auto';
    }
  }, [text, connected, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  }, []);

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
      // ignore
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [sendMessage]);

  const needsValue = contactType === 'tel' || contactType === 'email';

  return (
    <Wrapper>
      {title && (
        <Header>
          <HeaderTitle>
            <HeaderName>{title}</HeaderName>
            <HeaderStatus $online={connected}>
              {connected ? 'в сети' : 'соединение...'}
            </HeaderStatus>
          </HeaderTitle>
        </Header>
      )}

      {!isOwner && (
        <ContactPanel>
          <span style={{ opacity: 0.65 }}>Способ связи:</span>
          <ContactSelect
            value={contactType}
            onChange={e => handleContactChange(e.target.value, contactValue)}
          >
            {CONTACT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </ContactSelect>
          {needsValue && (
            <ContactInput
              type={contactType === 'email' ? 'email' : 'tel'}
              placeholder={contactType === 'email' ? 'your@email.com' : '+7...'}
              value={contactValue}
              onChange={e => setContactValue(e.target.value)}
              onBlur={() => handleContactChange(contactType, contactValue)}
            />
          )}
        </ContactPanel>
      )}

      <MsgList ref={listRef}>
        {messages.map(msg => {
          const out = (msg.source === MessageSource.Sender) !== isOwner;
          return (
            <MsgRow key={msg.id} $out={out}>
              <Bubble $out={out}>
                {msg.attachmentUrl && <AttachImg src={msg.attachmentUrl} alt='attachment' />}
                {msg.text && <BubbleText>{msg.text}</BubbleText>}
                <BubbleTime $out={out}>{formatTime(msg.createdAt)}</BubbleTime>
              </Bubble>
            </MsgRow>
          );
        })}
      </MsgList>

      <InputArea>
        <RoundBtn
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title='Прикрепить изображение'
        >
          📎
        </RoundBtn>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          style={{ display: 'none' }}
          onChange={handleAttach}
        />
        <TextInput
          ref={textRef}
          rows={1}
          placeholder={connected ? 'Сообщение...' : 'Соединение...'}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          disabled={!connected}
        />
        <SendBtn
          $active={!!text.trim() && connected}
          onClick={handleSend}
          disabled={!text.trim() || !connected}
          title='Отправить'
        >
          ➤
        </SendBtn>
      </InputArea>
    </Wrapper>
  );
}
