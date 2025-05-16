import React from 'react';
import styled, { css } from 'styled-components';
import { useColorScheme } from '@/components/useColorScheme';

const LoadingContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  height: 100%;

  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export type LoadingProps = {
  size?: number | 'small' | 'large';
};

export const Loading: React.FC<LoadingProps> = ({ size = 'large' }) => {
  const theme = useColorScheme();

  return <RawLoading size={size} color={theme === 'dark' ? '#ffffff' : '#090633'} />;
};

type RawLoadingProps = LoadingProps & {
  color: string;
};

const ActivityIndicator = styled.div<{ $size: LoadingProps['size'], $color: string }>`
  ${({ $size }) => {
      const width = (() => {
        switch ($size) {
          case 'small':
            return 20;
          case 'large':
            return 40;
          default:
            return $size ?? 20;
        }
      })();

      return css`
        width: ${width}px;
        height: ${width}px;
    `;
  }}

  border-radius: 50%;
  border: 2px solid ${({ $color }) => $color};
  border-top-color: transparent;
`;

export const RawLoading: React.FC<RawLoadingProps> = ({ size = 'large', color }) => {
  return (
    <LoadingContainer>
      <ActivityIndicator $size={size} $color={color} />
    </LoadingContainer>
  );
};
