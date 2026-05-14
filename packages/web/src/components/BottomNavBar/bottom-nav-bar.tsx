'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { forThemeValue } from '@/themes/utils';
import { qrScanner } from '@telegram-apps/sdk-react';
import { showErrorMessage } from '@/utils/messages';
import { PRODUCTION_URL } from '@/constants/site';

const Pill = styled.nav`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 10px 8px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
  background: ${forThemeValue('rgba(255,255,255,0.88)', 'rgba(255,255,255,0.07)')};
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid ${forThemeValue('rgba(0,0,0,0.08)', 'rgba(255,255,255,0.12)')};
  border-radius: 40px;
  box-shadow: ${forThemeValue('0 8px 32px rgba(0,0,0,0.1)', '0 8px 40px rgba(0,0,0,0.5)')};

  @media (min-width: 1024px) {
    display: none;
  }
`;

const itemBase = `
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 18px;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
`;

const inactiveColor = forThemeValue('rgba(0,0,0,0.35)', 'rgba(255,255,255,0.35)');

const ItemLink = styled(Link)<{ $active: boolean }>`
  ${itemBase}
  svg {
    stroke: ${({ $active, theme }) => ($active ? '#6C8EFF' : inactiveColor({ theme }))};
    filter: ${({ $active }) =>
      $active ? 'drop-shadow(0 0 8px rgba(108,142,255,0.8))' : 'none'};
    transition: stroke 0.2s, filter 0.2s;
  }
`;

const ItemButton = styled.button<{ $active: boolean }>`
  ${itemBase}
  svg {
    stroke: ${({ $active, theme }) => ($active ? '#6C8EFF' : inactiveColor({ theme }))};
    filter: ${({ $active }) =>
      $active ? 'drop-shadow(0 0 8px rgba(108,142,255,0.8))' : 'none'};
    transition: stroke 0.2s, filter 0.2s;
  }
`;

const Label = styled.span<{ $active: boolean }>`
  font-size: 10px;
  letter-spacing: 0.3px;
  color: ${({ $active, theme }) => ($active ? '#6C8EFF' : inactiveColor({ theme }))};
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
  transition: color 0.2s;
`;

const ChatIcon = () => (
  <svg
    width='22'
    height='22'
    fill='none'
    strokeWidth='1.8'
    strokeLinecap='round'
    strokeLinejoin='round'
    viewBox='0 0 24 24'
  >
    <path d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
  </svg>
);

const CarIcon = () => (
  <svg
    width='22'
    height='22'
    fill='none'
    strokeWidth='1.8'
    strokeLinecap='round'
    strokeLinejoin='round'
    viewBox='0 0 24 24'
  >
    <path d='M16 3H8L5 10H19L16 3Z' />
    <path d='M5 10V17H7M19 10V17H17M7 17A2 2 0 1011 17M13 17A2 2 0 1017 17' />
  </svg>
);

const ProfileIcon = () => (
  <svg
    width='22'
    height='22'
    fill='none'
    strokeWidth='1.8'
    strokeLinecap='round'
    strokeLinejoin='round'
    viewBox='0 0 24 24'
  >
    <path d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
  </svg>
);

const QrIcon = () => (
  <svg
    width='22'
    height='22'
    fill='none'
    strokeWidth='1.8'
    strokeLinecap='round'
    strokeLinejoin='round'
    viewBox='0 0 24 24'
  >
    <rect x='3' y='3' width='7' height='7' rx='1' />
    <rect x='14' y='3' width='7' height='7' rx='1' />
    <rect x='3' y='14' width='7' height='7' rx='1' />
    <path d='M14 14h.01M18 14h.01M14 18h.01M18 18h.01' />
  </svg>
);

const HIDDEN_ROUTES = ['/auth'];
const HIDDEN_PREFIXES = ['/g/'];

export const BottomNavBar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleQrScan = useCallback(async () => {
    if (qrScanner.open.isAvailable()) {
      try {
        await qrScanner.open({
          text: 'QR-код автомобиля или водителя',
          onCaptured: (qrContent: string) => {
            if (qrContent?.startsWith(PRODUCTION_URL)) {
              qrScanner.close();
              router.push(qrContent.slice(PRODUCTION_URL.length));
            } else {
              alert('Некорректный QR-код');
            }
          }
        });
      } catch (error) {
        console.error('Error opening QR scanner:', error);
      }
    } else {
      showErrorMessage('QR-сканнер недоступен', 'QR-сканнер доступен только в приложении Telegram.');
    }
  }, [router]);

  if (
    HIDDEN_ROUTES.includes(pathname) ||
    HIDDEN_PREFIXES.some(p => pathname.startsWith(p))
  ) {
    return null;
  }

  const active = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <Pill>
      <ItemLink href='/messages' $active={active('/messages')}>
        <ChatIcon />
        <Label $active={active('/messages')}>Чаты</Label>
      </ItemLink>

      <ItemLink href='/' $active={active('/', true)}>
        <CarIcon />
        <Label $active={active('/', true)}>Авто</Label>
      </ItemLink>

      <ItemLink href='/profile' $active={active('/profile')}>
        <ProfileIcon />
        <Label $active={active('/profile')}>Профиль</Label>
      </ItemLink>

      <ItemButton $active={false} onClick={handleQrScan}>
        <QrIcon />
        <Label $active={false}>Скан</Label>
      </ItemButton>
    </Pill>
  );
};
