'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Navbar,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Avatar
} from '@heroui/react';
import styled, { css } from 'styled-components';
import { PageContainer, pagePaddingTop, Spacer } from '@/ui/Styled';
import { isTelegramWebApp, transferLinkToTelegram } from '@/utils/telegram';
import { Button } from '@/ui/Button';
import { BottomNavBar } from '@/components/BottomNavBar/bottom-nav-bar';

interface NavigationProps {
  children?: React.ReactNode;
}

const StyledNavbar = styled(Navbar)`
  &:not([data-menu-open='true']) {
    backdrop-filter: none;
  }
`;

const TgSpace = styled.div`
  padding-top: ${pagePaddingTop};
`;

const StyledMenu = styled(NavbarMenu)`
  margin-top: env(safe-area-inset-top);
  display: flex;
  flex-flow: column;
  gap: 30px;
  padding-top: 30px;
`;

const StyledItem = styled(NavbarMenuItem)<{ $active?: boolean }>`
  font-size: 30px;

  ${({ $active }) =>
    $active &&
    css`
      font-weight: 700;
    `}
`;

export const Navigation: React.FC<NavigationProps> = ({ children }) => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const menuItems = [
    { name: 'Мои авто', href: '/', requiresAuth: true },
    { name: 'Добавить авто', href: '/car/new', requiresAuth: true },
    { name: 'Сообщения', href: '/messages', requiresAuth: true },
    { name: 'Профиль', href: '/profile', requiresAuth: true }
  ];

  const filteredMenuItems = menuItems;

  const telegramAppLink = useMemo(() => transferLinkToTelegram(pathname), [pathname]);
  const isFullscreenChat = /^\/messages\/\d+/.test(pathname) || /^\/g\/[^/]+\/chat/.test(pathname);
  const isChatLayout = pathname.startsWith('/messages') || /^\/g\/[^/]+\/chat/.test(pathname);

  if (pathname.startsWith('/auth') || pathname.startsWith('/ilost')) {
    return <>{children}</>;
  }

  return (
    <div className={`${isChatLayout ? 'h-dvh' : 'min-h-screen'} flex flex-col overflow-hidden`}>
      {isTelegramWebApp ? (
        <>
          <TgSpace />
        </>
      ) : (
        <div className='hidden lg:block'>
          <StyledNavbar
            isBordered
            maxWidth='xl'
            position='sticky'
            onMenuOpenChange={setIsMenuOpen}
            isMenuOpen={isMenuOpen}
          >
            <NavbarContent>
              <NavbarMenuToggle aria-label='Открыть меню' className='sm:hidden' />
              <Spacer />
              <Button size='sm' targetBlank href={telegramAppLink}>
                Продолжить в Telegram
              </Button>
            </NavbarContent>

            <NavbarContent className='hidden sm:flex gap-4' justify='center'>
              {filteredMenuItems.slice(0, -1).map(item => (
                <NavbarItem key={item.href} isActive={pathname === item.href}>
                  <Link
                    href={item.href}
                    className={`w-full ${pathname === item.href ? 'font-bold' : 'text-foreground'}`}
                  >
                    {item.name}
                  </Link>
                </NavbarItem>
              ))}
            </NavbarContent>

            <NavbarContent justify='end'>
              <NavbarItem>
                <Link href='/profile'>
                  <Avatar
                    size='sm'
                    isBordered={pathname.startsWith('/profile')}
                    color={pathname.startsWith('/profile') ? 'primary' : 'default'}
                  />
                </Link>
              </NavbarItem>
            </NavbarContent>

            <StyledMenu>
              {filteredMenuItems.map(item => (
                <StyledItem $active={pathname === item.href} key={item.href}>
                  <Link href={item.href}>{item.name}</Link>
                </StyledItem>
              ))}
            </StyledMenu>
          </StyledNavbar>
        </div>
      )}

      {isChatLayout ? (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      ) : (
        <PageContainer>{children}</PageContainer>
      )}

      {!isFullscreenChat && <BottomNavBar />}
    </div>
  );
};
