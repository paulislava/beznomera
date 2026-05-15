'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';

import { ChatDetails, ChatInfo } from '@shared/chat/chat.types';
import { themeable } from '@/themes/utils';
import { chatService } from '@/services';
import { ChatWindow } from './ChatWindow';
import { useChatList } from '@/hooks/useChatList';

const SIDEBAR_DEFAULT = 300;
const SIDEBAR_MIN = 220;
const SIDEBAR_MAX = 520;
const MOBILE_BP = 640;

// ─── Layout ──────────────────────────────────────────────────────────────────

const Layout = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
  position: relative;
`;

const SidebarPanel = styled.div<{ $open: boolean; $width: number }>`
  width: ${({ $open, $width }) => ($open ? `${$width}px` : '0')};
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: ${themeable('secondaryBackground')};
  border-right: 1px solid rgba(128, 128, 128, 0.1);
  overflow: hidden;
  transition: width 0.25s ease;

  @media (max-width: ${MOBILE_BP - 1}px) {
    width: 100% !important;
    flex-shrink: 1;
    display: ${({ $open }) => ($open ? 'flex' : 'none')};
    transition: none;
  }
`;

const SidebarInner = styled.div`
  width: 100%;
  min-width: ${SIDEBAR_MIN}px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: ${MOBILE_BP - 1}px) {
    min-width: unset;
  }
`;

const SidebarHeader = styled.div`
  padding: 14px 16px;
  font-size: 18px;
  font-weight: 700;
  color: ${themeable('textColor')};
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

const SidebarScroll = styled.div`
  overflow-y: auto;
  flex: 1;
`;

// ─── Chat item (Telegram style) ───────────────────────────────────────────────

const ChatItem = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  background: ${({ $active }) => ($active ? 'rgba(43, 130, 229, 0.1)' : 'transparent')};
  transition: background 0.1s;
  user-select: none;
  -webkit-user-select: none;

  &:hover {
    background: ${({ $active }) =>
      $active ? 'rgba(43, 130, 229, 0.13)' : themeable('mainBackgroundColor')};
  }
`;

const ChatAvatar = styled.div<{ $color: string }>`
  width: 50px;
  height: 50px;
  min-width: 50px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  color: #fff;
  font-size: 19px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ChatMeta = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const ChatTopRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
`;

const ChatName = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${themeable('textColor')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

const ChatTime = styled.span<{ $unread?: boolean }>`
  font-size: 12px;
  color: ${({ $unread }) => ($unread ? themeable('primaryColor') : themeable('textColor'))};
  opacity: ${({ $unread }) => ($unread ? 1 : 0.45)};
  flex-shrink: 0;
  white-space: nowrap;
`;

const ChatBottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
`;

const ChatPreview = styled.span`
  font-size: 13px;
  color: ${themeable('textColor')};
  opacity: 0.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

const UnreadBadge = styled.span`
  background: ${themeable('primaryColor')};
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 10px;
  padding: 2px 7px;
  min-width: 20px;
  text-align: center;
  flex-shrink: 0;
`;

// ─── Resize / layout ─────────────────────────────────────────────────────────

const ResizeHandle = styled.div`
  width: 5px;
  cursor: col-resize;
  flex-shrink: 0;
  background: transparent;
  transition: background 0.15s;

  &:hover,
  &:active {
    background: ${themeable('primaryColor')};
    opacity: 0.35;
  }

  @media (max-width: ${MOBILE_BP - 1}px) {
    display: none;
  }
`;

const MainArea = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;

  @media (max-width: ${MOBILE_BP - 1}px) {
    display: none;
  }
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

const ContextMenu = styled.div`
  position: fixed;
  transform: translate(0, -100%);
  background: ${themeable('secondaryBackground')};
  border: 1px solid rgba(128, 128, 128, 0.18);
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  z-index: 100;
  min-width: 160px;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#2b82e5', '#5856d6', '#ff2d55', '#ff9500', '#34c759', '#00c7be', '#af52de'];

function nameToColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function nameInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase();
}

function formatMsgTime(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'вчера';
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 7 * 24 * 60 * 60 * 1000) {
    return ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'][d.getDay()];
  }
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}

function previewText(chat: ChatInfo): string {
  const msg = chat.lastMessage;
  if (!msg) return '';
  if (msg.isDeleted) return 'Сообщение удалено';
  if (msg.attachmentUrl && !msg.text) return '📎 Изображение';
  return msg.text ?? '';
}

function chatTitle(chat: ChatInfo): string {
  return chat.senderName ?? `Чат #${chat.id}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChatListProps {
  initialChats: ChatInfo[];
  userId: number;
  selectedChatId?: number;
  initialChatDetails?: Record<number, ChatDetails>;
}

interface ChatMenuState {
  id: number;
  x: number;
  y: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChatList({
  initialChats,
  userId,
  selectedChatId,
  initialChatDetails = {}
}: ChatListProps) {
  const router = useRouter();
  const { chats, markRead, deleteChatForMe, deleteChatForAll } = useChatList(initialChats);
  const [selectedId, setSelectedId] = useState<number | null>(selectedChatId ?? null);
  const [detailsCache, setDetailsCache] = useState<Record<number, ChatDetails>>(initialChatDetails);
  const [loading, setLoading] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const [isMobile, setIsMobile] = useState(false);
  const [chatMenu, setChatMenu] = useState<ChatMenuState | null>(null);

  const isResizingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(0);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BP);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Sync selectedId when selectedChatId prop changes (navigation)
  useEffect(() => {
    if (selectedChatId != null) setSelectedId(selectedChatId);
  }, [selectedChatId]);

  // Merge server-preloaded details into cache
  useEffect(() => {
    if (Object.keys(initialChatDetails).length > 0) {
      setDetailsCache(prev => ({ ...prev, ...initialChatDetails }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Desktop resize drag
  const startResize = useCallback(
    (e: React.MouseEvent) => {
      isResizingRef.current = true;
      dragStartXRef.current = e.clientX;
      dragStartWidthRef.current = sidebarWidth;
      e.preventDefault();
    },
    [sidebarWidth]
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const next = dragStartWidthRef.current + (e.clientX - dragStartXRef.current);
      setSidebarWidth(Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, next)));
    };
    const onUp = () => {
      isResizingRef.current = false;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  useEffect(() => {
    if (!chatMenu) return;
    const close = () => setChatMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [chatMenu]);

  useEffect(
    () => () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    },
    []
  );

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

  const handleSelectChat = useCallback(
    (chatId: number) => {
      markRead(chatId);
      if (isMobile) {
        router.push(`/messages/${chatId}`);
      } else {
        setSelectedId(chatId);
        window.history.pushState(null, '', `/messages/${chatId}`);
      }
    },
    [isMobile, markRead, router]
  );

  const handleBack = useCallback(() => {
    router.push('/messages');
  }, [router]);

  const handleChatContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, chatId: number) => {
      e.preventDefault();
      const x = Math.min(Math.max(e.clientX, 80), window.innerWidth - 80);
      setChatMenu({ id: chatId, x, y: e.clientY });
    },
    []
  );

  const handleChatTouchStart = useCallback(
    (chatId: number) => (e: React.TouchEvent<HTMLDivElement>) => {
      const t = e.touches[0];
      const x = Math.min(Math.max(t.clientX, 80), window.innerWidth - 80);
      const y = t.clientY;
      longPressTimerRef.current = setTimeout(() => {
        setChatMenu({ id: chatId, x, y });
      }, 500);
    },
    []
  );

  const handleChatTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleDeleteForMe = useCallback(
    (chatId: number) => {
      deleteChatForMe(chatId);
      if (selectedId === chatId) {
        setSelectedId(null);
        if (isMobile) router.push('/messages');
        else window.history.pushState(null, '', '/messages');
      }
      setChatMenu(null);
    },
    [deleteChatForMe, selectedId, isMobile, router]
  );

  const handleDeleteForAll = useCallback(
    (chatId: number) => {
      deleteChatForAll(chatId);
      if (selectedId === chatId) {
        setSelectedId(null);
        if (isMobile) router.push('/messages');
        else window.history.pushState(null, '', '/messages');
      }
      setChatMenu(null);
    },
    [deleteChatForAll, selectedId, isMobile, router]
  );

  const selectedChat = chats.find(c => c.id === selectedId);
  const selectedDetails = selectedId != null ? detailsCache[selectedId] : undefined;

  // Mobile: when a chat is selected, show only the ChatWindow (full screen)
  if (isMobile && selectedId != null) {
    if (selectedDetails) {
      return (
        <ChatWindow
          key={selectedId}
          chatId={selectedId}
          initialMessages={selectedDetails.messages}
          currentUserId={userId}
          isOwner
          title={selectedChat ? chatTitle(selectedChat) : undefined}
          onBack={handleBack}
        />
      );
    }
    if (loading) {
      return <EmptyState style={{ flex: 1, display: 'flex' }}>Загрузка...</EmptyState>;
    }
  }

  // Desktop: split-pane layout / Mobile: just the list
  return (
    <Layout>
      <SidebarPanel $open $width={sidebarWidth}>
        <SidebarInner>
          <SidebarHeader>Сообщения</SidebarHeader>
          <SidebarScroll>
            {chats.map(chat => {
              const active = chat.id === selectedId;
              const unread = (chat.unreadCount ?? 0) > 0 && !active;
              const name = chatTitle(chat);
              const timeStr = formatMsgTime(chat.lastMessageAt ?? chat.createdAt);
              return (
                <ChatItem
                  key={chat.id}
                  $active={active}
                  onClick={() => handleSelectChat(chat.id)}
                  onContextMenu={e => handleChatContextMenu(e, chat.id)}
                  onTouchStart={handleChatTouchStart(chat.id)}
                  onTouchEnd={handleChatTouchEnd}
                  onTouchMove={handleChatTouchEnd}
                >
                  <ChatAvatar $color={nameToColor(name)}>{nameInitials(name)}</ChatAvatar>
                  <ChatMeta>
                    <ChatTopRow>
                      <ChatName>{name}</ChatName>
                      <ChatTime $unread={unread}>{timeStr}</ChatTime>
                    </ChatTopRow>
                    <ChatBottomRow>
                      <ChatPreview>{previewText(chat)}</ChatPreview>
                      {unread && <UnreadBadge>{chat.unreadCount}</UnreadBadge>}
                    </ChatBottomRow>
                  </ChatMeta>
                </ChatItem>
              );
            })}
          </SidebarScroll>
        </SidebarInner>
      </SidebarPanel>

      {chatMenu && (
        <ContextMenu
          style={{ left: chatMenu.x, top: chatMenu.y }}
          onClick={e => e.stopPropagation()}
        >
          <ContextMenuItem onClick={() => handleDeleteForMe(chatMenu.id)}>
            Удалить у меня
          </ContextMenuItem>
          <ContextMenuItem $danger onClick={() => handleDeleteForAll(chatMenu.id)}>
            Удалить у всех
          </ContextMenuItem>
        </ContextMenu>
      )}

      <ResizeHandle onMouseDown={startResize} />

      <MainArea>
        {selectedChat && selectedDetails ? (
          <ChatWindow
            key={selectedId}
            chatId={selectedChat.id}
            initialMessages={selectedDetails.messages}
            currentUserId={userId}
            isOwner
            title={chatTitle(selectedChat)}
          />
        ) : loading ? (
          <EmptyState>Загрузка...</EmptyState>
        ) : (
          <EmptyState>Выберите чат</EmptyState>
        )}
      </MainArea>
    </Layout>
  );
}
