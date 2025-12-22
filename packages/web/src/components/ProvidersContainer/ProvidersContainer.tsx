'use client';

import React from 'react';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import { ThemeProvider } from '@/context/Theme/Theme.context';
import { useThemeSync } from '@/hooks/useTheme';

export const ProvidersContainer = ({ children }: { children: React.ReactNode }) => {
  useThemeSync();

  return (
    <ThemeProvider>
      <HeroUIProvider>
        <ToastProvider placement='top-center' />
        {children}
      </HeroUIProvider>
    </ThemeProvider>
  );
};
