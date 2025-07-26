'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Button
} from '@heroui/react';
import { useTelegramApp } from '@/hooks/useTelegramApp';
import { useAuth } from '@/hooks/useAuth';
import styled from 'styled-components';

interface NavigationProps {
  children?: React.ReactNode;
}

const StyledNavbar = styled(Navbar)`
  &:not([data-menu-open='true']) {
    backdrop-filter: none;
  }
`;

export const Navigation: React.FC<NavigationProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isTelegramApp, isLoading } = useTelegramApp();
  const { authorized } = useAuth();

  // Если это Telegram Mini App, не показываем навигацию
  if (isLoading) {
    return <>{children}</>;
  }

  if (isTelegramApp) {
    return <>{children}</>;
  }

  const menuItems = [
    { name: 'Мои авто', href: '/', requiresAuth: true },
    { name: 'Добавить авто', href: '/car/new', requiresAuth: true }
  ];

  const filteredMenuItems = menuItems.filter(
    item => !item.requiresAuth || (item.requiresAuth && authorized)
  );

  const handleGoBack = () => {
    router.back();
  };

  // Показываем кнопку "Назад" только если мы не на главной странице
  const showBackButton = pathname !== '/';

  return (
    <div className='min-h-screen flex flex-col'>
      <StyledNavbar isBordered maxWidth='xl' position='sticky'>
        <NavbarContent>
          <NavbarMenuToggle aria-label='Открыть меню' className='sm:hidden' />
          <NavbarBrand>
            <Link href='/' className='font-bold text-inherit'>
              BEZNOMERA
            </Link>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className='hidden sm:flex gap-4' justify='center'>
          {filteredMenuItems.map(item => (
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

        {showBackButton && (
          <NavbarContent justify='end'>
            <NavbarItem>
              <Button variant='flat' color='default' size='sm' onPress={handleGoBack}>
                ← Назад
              </Button>
            </NavbarItem>
          </NavbarContent>
        )}

        <NavbarMenu>
          {filteredMenuItems.map(item => (
            <NavbarMenuItem key={item.href}>
              <Link
                href={item.href}
                className={`w-full ${pathname === item.href ? 'font-bold' : 'text-foreground'}`}
              >
                {item.name}
              </Link>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </StyledNavbar>

      <main className='flex-1 flex flex-col'>{children}</main>
    </div>
  );
};
