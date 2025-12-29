'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
import styled from 'styled-components';
import { PageContainer } from '@/ui/Styled';
import { isTelegramWebApp } from '@/utils/telegram';
import { qrScanner } from '@telegram-apps/sdk-react';
import qrCodeSvg from '@/assets/images/qrcode.svg';
import { useToggle } from '@/hooks/booleans';
import { showErrorMessage, showSuccessMessage } from '@/utils/messages';
import { PRODUCTION_URL } from '@/constants/site';

interface NavigationProps {
  children?: React.ReactNode;
}

const StyledNavbar = styled(Navbar)`
  &:not([data-menu-open='true']) {
    backdrop-filter: none;
  }
`;

const TgSpace = styled.div`
  padding-top: 60px;
  /* padding-top: env(safe-area-inset-top); */
`;

const QRCode = styled(qrCodeSvg)`
  cursor: pointer;
  fill: white;
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 32px;
  height: 32px;
  z-index: 100;
`;

export const Navigation: React.FC<NavigationProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  // const router = useRouter();
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Отслеживаем изменения пути
  useEffect(() => {
    setNavigationHistory(prev => {
      // Если это первый переход или путь изменился
      if (prev.length === 0 || prev[prev.length - 1] !== pathname) {
        return [...prev, pathname];
      }
      return prev;
    });
  }, [pathname]);

  // Закрываем меню при изменении пути
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const menuItems = [
    { name: 'Мои авто', href: '/', requiresAuth: true },
    { name: 'Добавить авто', href: '/car/new', requiresAuth: true }
  ];

  const filteredMenuItems = menuItems;

  // const handleGoBack = () => {
  //   router.back();
  // };

  const handleMenuToggle = useToggle(setIsMenuOpen);

  const handleQrCodeScan = useCallback(async () => {
    if (qrScanner.open.isAvailable()) {
      try {
        const promise = qrScanner.open({
          text: 'Scan the QR Code', // Optional text to display
          onCaptured: (qrContent: string) => {
            if (qrContent?.startsWith(PRODUCTION_URL)) {
              qrScanner.close();
              router.push(qrContent.slice(PRODUCTION_URL.length));
            } else {
              alert('Некорректный QR-код');
            }
          }
        });

        // This promise resolves when the scanner is closed
        await promise;
        console.log('QR Scanner closed');
      } catch (error) {
        console.error('Error opening QR scanner:', error);
      }
    } else {
      showErrorMessage('Недоступен QR-сканнер', 'QR-сканнер недоступен в этой версии Telegram.');
    }
  }, [router]);

  // Показываем кнопку "Назад" только если есть история навигации и мы не на главной странице
  const showBackButton = navigationHistory.length > 1 && pathname !== '/';

  return (
    <div className='min-h-screen flex flex-col'>
      {isTelegramWebApp ? (
        <>
          <TgSpace />
        </>
      ) : (
        <StyledNavbar isBordered maxWidth='xl' position='sticky' isMenuOpen={isMenuOpen}>
          <NavbarContent>
            <NavbarMenuToggle
              aria-label='Открыть меню'
              className='sm:hidden'
              onClick={handleMenuToggle}
            />
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
                <Button variant='flat' color='default' size='sm'>
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
      )}

      <PageContainer>{children}</PageContainer>
      {isTelegramWebApp && <QRCode onClick={handleQrCodeScan} />}
    </div>
  );
};
