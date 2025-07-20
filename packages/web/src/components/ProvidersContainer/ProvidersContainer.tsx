'use client';

import React from 'react';
import { HeroUIProvider } from '@heroui/react';

export const ProvidersContainer = ({ children }: { children: React.ReactNode }) => {
  return <HeroUIProvider>{children}</HeroUIProvider>;
};
