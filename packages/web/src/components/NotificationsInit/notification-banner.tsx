'use client';

import React from 'react';
import styled from 'styled-components';
import { Button } from '@/ui/Button';
import { themeable } from '@/themes/utils';

interface NotificationBannerProps {
  onEnable(): Promise<void>;
  onDismiss(): void;
}

const Banner = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px));
  background: ${themeable('mainBackgroundColor')};
  border-top: 1px solid ${themeable('secondaryBackground')};
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.2);
`;

const Text = styled.span`
  flex: 1;
  font-size: 14px;
  color: ${themeable('textColor')};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  font-size: 20px;
  line-height: 1;
  color: ${themeable('textColor')};
  opacity: 0.5;

  &:hover {
    opacity: 1;
  }
`;

export function NotificationBanner({ onEnable, onDismiss }: NotificationBannerProps) {
  return (
    <Banner>
      <Text>Включить уведомления о сообщениях?</Text>
      <Button size='sm' onClick={onEnable}>
        Включить
      </Button>
      <CloseButton onClick={onDismiss} aria-label='Закрыть'>
        ✕
      </CloseButton>
    </Banner>
  );
}
