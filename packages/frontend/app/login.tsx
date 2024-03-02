import styled from 'styled-components/native';
import React, { useCallback } from 'react';
import { TextInput } from 'react-native';
import Button from '@/components/Button/Button';
import TelegramLoginButton from 'telegram-login-button';

import { Text } from '../components/Themed';

const LoginContainer = styled(Text)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
`;

export default function LoginPage(): React.ReactNode {
  const onTelegramAuth = useCallback(data => {
    console.dir(data);
    alert('Auth!');
  }, []);

  return (
    <LoginContainer>
      <TelegramLoginButton botName='beznomera_bot' dataOnauth={onTelegramAuth} />
    </LoginContainer>
  );
}
