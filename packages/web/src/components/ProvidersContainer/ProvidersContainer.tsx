'use client';

import React from 'react';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import { ThemeProvider } from '@/context/Theme/Theme.context';
import { useThemeSync } from '@/hooks/useTheme';
import styled from 'styled-components';
import { safeAreaInsetTop } from '@/ui/Styled';

const StyledToastProvider = styled(ToastProvider)`
  padding-top: ${safeAreaInsetTop()};
`;

export const ProvidersContainer = ({ children }: { children: React.ReactNode }) => {
  useThemeSync();

  return (
    <ThemeProvider>
      <HeroUIProvider>
        <StyledToastProvider placement='top-center' />
        {children}
      </HeroUIProvider>
    </ThemeProvider>
  );
};
