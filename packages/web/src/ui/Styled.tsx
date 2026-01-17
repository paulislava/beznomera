'use client';
import { isTelegramWebApp } from '@/utils/telegram';
import styled from 'styled-components';

export const CenterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

export const ButtonsRow = styled(CenterContainer)`
  flex-flow: row wrap;
  gap: 10px;
`;

export const ButtonsColumn = styled(CenterContainer)`
  flex-flow: column;
  gap: 10px;
`;

export const PageContainer = styled(CenterContainer).attrs({
  as: 'main'
})`
  flex: 1;
  max-width: 600px;
  margin: auto;
  padding: 20px;
  width: 100%;
`;

export const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
`;

export const Spacer = styled.div`
  flex: 1;
`;

export const safeAreaInsetTop = () => (isTelegramWebApp ? `env(safe-area-inset-top, 44px)` : '0px');

export const pagePaddingTop = isTelegramWebApp ? '60px' : '0';
