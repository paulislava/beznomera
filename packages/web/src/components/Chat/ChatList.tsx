'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { ChatDetails, ChatInfo } from '@shared/chat/chat.types';
import { themeable } from '@/themes/utils';
import { chatService } from '@/services';
import { ChatWindow } from './ChatWindow';
import { useChatList } from '@/hooks/useChatList';

const SIDEBAR_DEFAULT = 280;
const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 520;
const MOBILE_BP = 640;

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
  border-right: 1px solid ${themeable('mainBackgroundColor')};
  overflow: hidden;
  transition: width 0.25s ease;

  @media (max-width: ${MOBILE_BP - 1}px) {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    z-index: 10;
    width: ${({ $open }) => ($open ? 'min(85vw, 320px)' : '0')} !important;
    box-shadow: ${({ $open }) => ($open ? '4px 0 20px rgba(0,0,0,0.22)' : 'none')};
    transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.28s ease;
  }
`;

const SidebarInner = styled.div`
  width: 100%;
  min-width: ${SIDEBAR_MIN}px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SidebarHeader = styled.div`
  padding: 14px 16px;
  font-size: 17px;
  font-weight: 600;
  color: ${themeable('textColor')};
  border-bottom: 1px solid ${themeable('mainBackgroundColor')};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const IconBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${themeable('textColor')};
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  opacity: 0.65;
  &:hover {
    background: ${themeable('mainBackgroundColor')};
    opacity: 1;
  }
`;

const SidebarScroll = styled.div`
  overflow-y: auto;
  flex: 1;
`;

const ChatItem = styled.div<{ $active?: boolean }>`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid ${themeable('mainBackgroundColor')};
  background: ${({ $active }) => ($active ? themeable('primaryColor') : 'transparent')};
  transition: background 0.15s;
  user-select: none;
  -webkit-user-select: none;

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

const ChatItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
`;

const UnreadBadge = styled.span`
  background: ${themeable('primaryColor')};
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 10px;
  padding: 1px 6px;
  min-width: 18px;
  text-align: center;
  flex-shrink: 0;
`;

const ResizeHandle = styled.div`
  width: 5px;
  cursor: col-resize;
  flex-shrink: 0;
  background: transparent;
  transition: background 0.15s;
  &:hover,
  &:active {
    background: ${themeable('primaryColor')};
    opacity: 0.45;
  }
  @media (max-width: ${MOBILE_BP - 1}px) {
    display: none;
  }
`;

const MobileOverlay = styled.div`
  display: none;
  @media (max-width: ${MOBILE_BP - 1}px) {
    display: block;
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.38);
    z-index: 9;
  }
`;

const MainArea = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const MobileBar = styled.div`
  display: none;
  @media (max-width: ${MOBILE_BP - 1}px) {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: ${themeable('secondaryBackground')};
    border-bottom: 1px solid ${themeable('mainBackgroundColor')};
    flex-shrink: 0;
  }
`;

const MobileBarTitle = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${themeable('textColor')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
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

interface ChatListProps {
  initialChats: ChatInfo[];
  userId: number;
}

interface ChatMenuState {
  id: number;
  x: number;
  y: number;
}

function formatContact(contactType?: string | null, contactValue?: string | null): string {
  if (contactType === 'tel' && contactValue) return `Тел: ${contactValue}`;
  if (contactType === 'email' && contactValue) return `E-mail: ${contactValue}`;
  if (contactType === 'bot') return 'Через бот';
  return '';
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
  const { chats, markRead, deleteChatForMe, deleteChatForAll } = useChatList(initialChats);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailsCache, setDetailsCache] = useState<Record<number, ChatDetails>>({});
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const [isMobile, setIsMobile] = useState(false);
  const [chatMenu, setChatMenu] = useState<ChatMenuState | null>(null);

  const isResizingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(0);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect mobile and set initial sidebar state
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < MOBILE_BP;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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

  // Close chat context menu on outside click
  useEffect(() => {
    if (!chatMenu) return;
    const close = () => setChatMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [chatMenu]);

  // Cleanup long press timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

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
      setSelectedId(chatId);
      markRead(chatId);
      if (isMobile) setSidebarOpen(false);
    },
    [isMobile, markRead]
  );

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
      if (selectedId === chatId) setSelectedId(null);
      setChatMenu(null);
    },
    [deleteChatForMe, selectedId]
  );

  const handleDeleteForAll = useCallback(
    (chatId: number) => {
      deleteChatForAll(chatId);
      if (selectedId === chatId) setSelectedId(null);
      setChatMenu(null);
    },
    [deleteChatForAll, selectedId]
  );

  const selectedChat = chats.find(c => c.id === selectedId);
  const selectedDetails = selectedId != null ? detailsCache[selectedId] : undefined;

  return (
    <Layout>
      {isMobile && sidebarOpen && <MobileOverlay onClick={() => setSidebarOpen(false)} />}

      <SidebarPanel $open={sidebarOpen} $width={sidebarWidth}>
        <SidebarInner>
          <SidebarHeader>
            Сообщения
            <IconBtn onClick={() => setSidebarOpen(false)} title='Закрыть'>
              ✕
            </IconBtn>
          </SidebarHeader>
          <SidebarScroll>
            {chats.map(chat => {
              const active = chat.id === selectedId;
              const unread = (chat.unreadCount ?? 0) > 0 && !active;
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
                  <ChatItemRow>
                    <ChatItemName $active={active}>
                      {chat.senderName ?? `Чат #${chat.id}`}
                    </ChatItemName>
                    {unread && <UnreadBadge>{chat.unreadCount}</UnreadBadge>}
                  </ChatItemRow>
                  <ChatItemPreview $active={active}>{previewText(chat)}</ChatItemPreview>
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

      {!isMobile && <ResizeHandle onMouseDown={startResize} />}

      <MainArea>
        <MobileBar>
          <IconBtn onClick={() => setSidebarOpen(v => !v)} title='Список чатов'>
            ☰
          </IconBtn>
          <MobileBarTitle>{selectedChat ? chatTitle(selectedChat) : 'Сообщения'}</MobileBarTitle>
        </MobileBar>

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
