import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import styled from 'styled-components/native';
import { useColorScheme } from '@/components/useColorScheme';

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const Loading: React.FC = () => {
  const theme = useColorScheme();

  return (
    <LoadingContainer>
      <ActivityIndicator size='large' color={theme === 'dark' ? '#ffffff' : '#090633'} />
    </LoadingContainer>
  );
};
