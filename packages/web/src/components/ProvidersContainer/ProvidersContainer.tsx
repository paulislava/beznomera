'use client';

import React from 'react';
import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider } from '@/context/Theme/Theme.context';
import { ThemeSync } from '@/components/ThemeSync/ThemeSync';

export const ProvidersContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <ThemeSync>
        <HeroUIProvider>{children}</HeroUIProvider>
      </ThemeSync>
    </ThemeProvider>
  );
};
