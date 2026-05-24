'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Select as HeroSelect, SelectItem } from '@heroui/react';
import { Input as HeroInput } from '@heroui/input';

import { useChat } from '@/hooks/useChat';
import {
  ChatContactBody,
  ChatDetails,
  ChatMessageInfo,
  MessageSource,
  MessageType
} from '@shared/chat/chat.types';
import { themeable } from '@/themes/utils';
import { chatService, fileService } from '@/services';
import { FileFolder } from '@shared/file/file.types';

// ─── Layout ──────────────────────────────────────────────────────────────────

const Wrapper = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: ${themeable('mainBackgroundColor')};
  overflow: hidden;
`;

// ─── Header ──────────────────────────────────────────────────────────────────

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px 0 8px;
  min-height: 52px;
  flex-shrink: 0;
  background: ${themeable('secondaryBackground')};
  border-bottom: 1px solid rgba(128, 128, 128, 0.15);
`;

const BackBtn = styled.button`
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

const HeaderStatus = styled.div<{ $typing: boolean; $online: boolean }>`
  font-size: 12px;
  color: ${({ $typing, $online }) =>
    $typing ? themeable('primaryColor') : $online ? '#4cd964' : themeable('textColor')};
  opacity: ${({ $typing, $online }) => ($typing || $online ? 1 : 0.45)};
  margin-top: 1px;
  font-style: ${({ $typing }) => ($typing ? 'italic' : 'normal')};
`;

// ─── Selection bar (top, replaces header in selection mode) ──────────────────

const SelectionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  min-height: 52px;
  background: ${themeable('secondaryBackground')};
  border-bottom: 1px solid rgba(128, 128, 128, 0.15);
  flex-shrink: 0;
`;

const SelectionCancelBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: ${themeable('textColor')};
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition:
    opacity 0.15s,
    background 0.15s;
  flex-shrink: 0;

  &:hover {
    opacity: 1;
    background: ${themeable('mainBackgroundColor')};
  }
`;

const SelectionCount = styled.span`
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: ${themeable('textColor')};
`;

const SelectionActionBtn = styled.button<{ $danger?: boolean }>`
  background: none;
  border: 1px solid ${({ $danger }) => ($danger ? '#e53e3e' : themeable('primaryColor'))};
  border-radius: 16px;
  padding: 5px 12px;
  font-size: 13px;
  cursor: pointer;
  color: ${({ $danger }) => ($danger ? '#e53e3e' : themeable('primaryColor'))};
  transition: background 0.15s;
  white-space: nowrap;

  &:hover {
    background: ${({ $danger }) => ($danger ? 'rgba(229,62,62,0.08)' : 'rgba(43,130,229,0.08)')};
  }
`;

// ─── Message list ─────────────────────────────────────────────────────────────

const MsgList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  overscroll-behavior: contain;
`;

const MsgRow = styled.div<{ $out: boolean; $selectionMode?: boolean }>`
  display: flex;
  justify-content: ${({ $out }) => ($out ? 'flex-end' : 'flex-start')};
  align-items: flex-end;
  gap: 2px;
  position: relative;
  padding: 1px ${({ $selectionMode }) => ($selectionMode ? '4px' : '0')};
  padding-left: ${({ $selectionMode }) => ($selectionMode ? '36px' : '0')};
  transition: padding-left 0.18s;
`;

// ─── Telegram-style selection checkmark ──────────────────────────────────────

const SelectionCheckmark = styled.div<{ $selected: boolean }>`
  position: absolute;
  left: 4px;
  bottom: 6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid
    ${({ $selected }) => ($selected ? themeable('primaryColor') : 'rgba(128,128,128,0.38)')};
  background: ${({ $selected }) => ($selected ? themeable('primaryColor') : 'transparent')};
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    background 0.15s,
    border-color 0.15s;
  cursor: pointer;
`;

const Bubble = styled.div<{
  $out: boolean;
  $deleted?: boolean;
  $selectionMode?: boolean;
  $selected?: boolean;
}>`
  max-width: 75%;
  padding: 8px 12px 6px;
  border-radius: ${({ $out }) => ($out ? '18px 18px 4px 18px' : '18px 18px 18px 4px')};
  background: ${({ $out }) =>
    $out ? 'var(--cs-bubble-out, #2b82e5)' : themeable('secondaryBackground')};
  color: ${({ $out, $deleted }) =>
    $deleted ? themeable('textColor') : $out ? '#fff' : themeable('textColor')};
  font-size: 14px;
  line-height: 1.45;
  word-break: break-word;
  box-shadow: ${({ $selected }) =>
    $selected
      ? '0 0 0 2px var(--cs-primary, #2b82e5), 0 1px 3px rgba(0,0,0,0.14)'
      : '0 1px 3px rgba(0,0,0,0.14)'};
  position: relative;
  opacity: ${({ $deleted }) => ($deleted ? 0.5 : 1)};
  cursor: ${({ $selectionMode }) => ($selectionMode ? 'pointer' : 'default')};
  user-select: none;
  -webkit-user-select: none;
  transition: box-shadow 0.15s;
`;

const BubbleText = styled.span`
  display: block;
  padding-right: 44px;
`;

const DeletedText = styled.span`
  display: block;
  padding-right: 44px;
  font-style: italic;
`;

const BubbleTime = styled.span<{ $out: boolean }>`
  font-size: 11px;
  opacity: 0.65;
  position: absolute;
  bottom: 6px;
  right: 10px;
  color: ${({ $out }) => ($out ? 'rgba(255,255,255,0.85)' : themeable('textColor'))};
`;

// ─── Image skeleton ───────────────────────────────────────────────────────────

const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const ImgSkeleton = styled.div`
  width: 220px;
  height: 160px;
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    rgba(128, 128, 128, 0.15) 25%,
    rgba(128, 128, 128, 0.28) 50%,
    rgba(128, 128, 128, 0.15) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  margin-bottom: 2px;
`;

const AttachImg = styled.img`
  max-width: 220px;
  max-height: 220px;
  border-radius: 12px;
  display: block;
  margin-bottom: 2px;
  cursor: zoom-in;
`;

const Lightbox = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
`;

const LightboxImg = styled.img`
  max-width: 95vw;
  max-height: 95vh;
  border-radius: 8px;
  object-fit: contain;
  cursor: default;
  user-select: none;
`;

const LightboxClose = styled.button`
  position: fixed;
  top: 16px;
  right: 20px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

// ─── Context menu ─────────────────────────────────────────────────────────────

const ContextMenu = styled.div`
  position: fixed;
  transform: translate(-50%, calc(-100% - 8px));
  background: ${themeable('secondaryBackground')};
  border: 1px solid rgba(128, 128, 128, 0.18);
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  z-index: 1000;
  min-width: 148px;
  white-space: nowrap;
`;

const ContextMenuItem = styled.button<{ $danger?: boolean }>`
  display: block;
  width: 100%;
  padding: 9px 14px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: 13px;
  color: ${({ $danger }) => ($danger ? '#e53e3e' : themeable('textColor'))};

  &:hover {
    background: ${themeable('mainBackgroundColor')};
  }

  & + & {
    border-top: 1px solid rgba(128, 128, 128, 0.12);
  }
`;

// ─── System message ───────────────────────────────────────────────────────────

const SystemMsgRow = styled.div`
  display: flex;
  justify-content: center;
  margin: 6px 0;
`;

const SystemMsgBubble = styled.div`
  background: ${themeable('secondaryBackground')};
  color: ${themeable('textColor')};
  font-size: 12px;
  opacity: 0.7;
  padding: 4px 14px;
  border-radius: 12px;
  text-align: center;
`;

// ─── Contact panel ────────────────────────────────────────────────────────────

const ContactPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  background: ${themeable('secondaryBackground')};
  border-bottom: 1px solid rgba(128, 128, 128, 0.12);
  flex-shrink: 0;
`;

// ─── Input area ───────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  onBack?: () => void;
}

interface MenuState {
  id: number;
  x: number;
  y: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChatWindow({
  chatId,
  initialMessages,
  isOwner = false,
  title,
  initialContact,
  onBack
}: ChatWindowProps) {
  const {
    messages,
    connected,
    sendMessage,
    sendTyping,
    partnerTyping,
    deleteMessageForAll,
    deleteMessageForMe,
    deleteMessagesForAll,
    deleteMessagesForMe
  } = useChat({ chatId, initialMessages, isOwner });

  const listRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const isAtBottomRef = useRef(true);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [contactType, setContactType] = useState(initialContact?.contactType ?? 'none');
  const [contactValue, setContactValue] = useState(initialContact?.contactValue ?? '');
  const [menuState, setMenuState] = useState<MenuState | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set<number>());
  const [imgLoaded, setImgLoaded] = useState<Record<number, boolean>>({});
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const selectionMode = selectedIds.size > 0;

  const closeMenu = useCallback(() => setMenuState(null), []);
  const exitSelection = useCallback(() => setSelectedIds(new Set<number>()), []);

  const toggleSelect = useCallback((msgId: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  }, []);

  // Track scroll position
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  }, []);

  // Auto-scroll when at bottom
  useEffect(() => {
    const el = listRef.current;
    if (el && isAtBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Scroll to bottom on chat switch
  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
      isAtBottomRef.current = true;
    }
  }, [chatId]);

  // Close context menu on outside click
  useEffect(() => {
    if (!menuState) return;
    const close = () => setMenuState(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuState]);

  // Close lightbox on Escape
  useEffect(() => {
    if (!lightboxUrl) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxUrl(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightboxUrl]);

  useEffect(
    () => () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    },
    []
  );

  // Right-click: in selection mode toggles selection, otherwise opens context menu
  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      const msgId = parseInt(e.currentTarget.dataset.msgid ?? '');
      if (!msgId) return;
      if (selectionMode) {
        toggleSelect(msgId);
        return;
      }
      const x = Math.min(Math.max(e.clientX, 80), window.innerWidth - 80);
      setMenuState({ id: msgId, x, y: e.clientY });
    },
    [selectionMode, toggleSelect]
  );

  // Click on bubble in selection mode toggles selection
  const handleBubbleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!selectionMode) return;
      const msgId = parseInt(e.currentTarget.dataset.msgid ?? '');
      if (!msgId) return;
      toggleSelect(msgId);
    },
    [selectionMode, toggleSelect]
  );

  // Long press enters selection mode
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const msgId = parseInt(e.currentTarget.dataset.msgid ?? '');
      if (!msgId) return;
      if (selectionMode) return;
      longPressTimerRef.current = setTimeout(() => {
        toggleSelect(msgId);
      }, 500);
    },
    [selectionMode, toggleSelect]
  );

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

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
    sendTyping(false);
    setText('');
    if (textRef.current) textRef.current.style.height = 'auto';
    isAtBottomRef.current = true;
    setTimeout(() => {
      const el = listRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 0);
  }, [text, connected, sendMessage, sendTyping]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      e.target.style.height = 'auto';
      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
      sendTyping(e.target.value.length > 0);
    },
    [sendTyping]
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
      // ignore
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [sendMessage]);

  const handleDeleteSelectedForMe = useCallback(() => {
    deleteMessagesForMe([...selectedIds]);
    exitSelection();
  }, [deleteMessagesForMe, selectedIds, exitSelection]);

  const handleDeleteSelectedForAll = useCallback(() => {
    deleteMessagesForAll([...selectedIds]);
    exitSelection();
  }, [deleteMessagesForAll, selectedIds, exitSelection]);

  const menuMsg = menuState ? messages.find(m => m.id === menuState.id) : null;
  const needsValue = contactType === 'tel' || contactType === 'email';

  return (
    <Wrapper>
      {/* Top bar: selection bar or header */}
      {selectionMode ? (
        <SelectionBar>
          <SelectionCancelBtn onClick={exitSelection} title='Отменить выделение'>
            ✕
          </SelectionCancelBtn>
          <SelectionCount>{selectedIds.size} выбрано</SelectionCount>
          <SelectionActionBtn onClick={handleDeleteSelectedForMe}>
            Удалить у меня
          </SelectionActionBtn>
          <SelectionActionBtn $danger onClick={handleDeleteSelectedForAll}>
            Удалить у всех
          </SelectionActionBtn>
        </SelectionBar>
      ) : (
        title && (
          <Header>
            {onBack && (
              <BackBtn onClick={onBack} title='Назад'>
                ‹
              </BackBtn>
            )}
            <HeaderTitle>
              <HeaderName>{title}</HeaderName>
              <HeaderStatus $typing={partnerTyping} $online={connected}>
                {partnerTyping ? 'печатает...' : connected ? 'в сети' : 'соединение...'}
              </HeaderStatus>
            </HeaderTitle>
          </Header>
        )
      )}

      {!isOwner && messages.length === 0 && (
        <ContactPanel>
          <HeroSelect
            label='Способ связи'
            size='sm'
            variant='faded'
            selectedKeys={[contactType]}
            onSelectionChange={keys => {
              if (keys === 'all') return;
              const selected = Array.from(keys)[0] as string;
              handleContactChange(selected, contactValue);
            }}
            style={{ minWidth: 180 }}
          >
            {CONTACT_OPTIONS.map(o => (
              <SelectItem key={o.value}>{o.label}</SelectItem>
            ))}
          </HeroSelect>
          {needsValue && (
            <HeroInput
              type={contactType === 'email' ? 'email' : 'tel'}
              label={contactType === 'email' ? 'E-mail для ответа' : 'Телефон для ответа'}
              placeholder={contactType === 'email' ? 'your@email.com' : '+7...'}
              value={contactValue}
              onValueChange={setContactValue}
              onBlur={() => handleContactChange(contactType, contactValue)}
              size='sm'
              variant='faded'
              style={{ minWidth: 200 }}
            />
          )}
        </ContactPanel>
      )}

      <MsgList ref={listRef} onScroll={handleScroll}>
        {messages.map(msg => {
          if (msg.type === MessageType.Call || msg.type === MessageType.System) {
            return (
              <SystemMsgRow key={msg.id}>
                <SystemMsgBubble>{msg.text}</SystemMsgBubble>
              </SystemMsgRow>
            );
          }

          const out = (msg.source === MessageSource.Sender) !== isOwner;
          const selected = selectedIds.has(msg.id);

          return (
            <MsgRow key={msg.id} $out={out} $selectionMode={selectionMode}>
              {selectionMode && (
                <SelectionCheckmark $selected={selected} onClick={() => toggleSelect(msg.id)}>
                  {selected && '✓'}
                </SelectionCheckmark>
              )}
              <Bubble
                $out={out}
                $deleted={msg.isDeleted}
                $selectionMode={selectionMode}
                $selected={selected}
                data-msgid={msg.id}
                onClick={handleBubbleClick}
                onContextMenu={handleContextMenu}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchEnd}
              >
                {msg.attachmentUrl && !msg.isDeleted && (
                  <>
                    {!imgLoaded[msg.id] && <ImgSkeleton />}
                    <AttachImg
                      src={msg.attachmentUrl}
                      alt='attachment'
                      style={{ display: imgLoaded[msg.id] ? 'block' : 'none' }}
                      onLoad={() => setImgLoaded(prev => ({ ...prev, [msg.id]: true }))}
                      onClick={e => {
                        e.stopPropagation();
                        setLightboxUrl(msg.attachmentUrl!);
                      }}
                    />
                  </>
                )}
                {msg.isDeleted ? (
                  <DeletedText>Сообщение удалено</DeletedText>
                ) : (
                  msg.text && <BubbleText>{msg.text}</BubbleText>
                )}
                <BubbleTime $out={out}>{formatTime(msg.createdAt)}</BubbleTime>
              </Bubble>
            </MsgRow>
          );
        })}
      </MsgList>

      {lightboxUrl && (
        <Lightbox onClick={() => setLightboxUrl(null)}>
          <LightboxClose onClick={() => setLightboxUrl(null)}>✕</LightboxClose>
          <LightboxImg src={lightboxUrl} alt='preview' onClick={e => e.stopPropagation()} />
        </Lightbox>
      )}

      {menuState && (
        <ContextMenu
          style={{ left: menuState.x, top: menuState.y }}
          onClick={e => e.stopPropagation()}
        >
          <ContextMenuItem
            onClick={() => {
              deleteMessageForMe(menuState.id);
              closeMenu();
            }}
          >
            Удалить у меня
          </ContextMenuItem>
          {menuMsg && !menuMsg.isDeleted && (
            <ContextMenuItem
              $danger
              onClick={() => {
                deleteMessageForAll(menuState.id);
                closeMenu();
              }}
            >
              Удалить у всех
            </ContextMenuItem>
          )}
        </ContextMenu>
      )}

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
