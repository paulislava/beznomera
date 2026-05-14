'use client';

import React from 'react';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import { ThemeProvider } from '@/context/Theme/Theme.context';
import styled from 'styled-components';
import { pagePaddingTop } from '@/ui/Styled';

const Container = styled(HeroUIProvider)`
  & [data-placement='top-center'] {
    top: ${pagePaddingTop};
  }

  & [data-placement='bottom-center'] {
    bottom: calc(96px + env(safe-area-inset-bottom, 0px));

    @media (min-width: 1024px) {
      bottom: 24px;
    }
  }
`;

export const ProvidersContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <Container>
        <ToastProvider placement='bottom-center' />
        {children}
      </Container>
    </ThemeProvider>
  );
};
