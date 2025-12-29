'use client';

import React from 'react';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import { ThemeProvider } from '@/context/Theme/Theme.context';
import { useThemeSync } from '@/hooks/useTheme';
import styled from 'styled-components';
import { isTelegramWebApp } from '@/utils/telegram';

const Container = styled(HeroUIProvider)`
  padding-top: ${isTelegramWebApp ? '60px' : 0};
`;

export const ProvidersContainer = ({ children }: { children: React.ReactNode }) => {
  useThemeSync();
  return (
    <ThemeProvider>
      <Container>
        <ToastProvider placement='top-center' />
        {children}
      </Container>
    </ThemeProvider>
  );
};
