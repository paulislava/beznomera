import styled from 'styled-components/native';
import React, { useCallback } from 'react';
import TelegramLoginButton, { TelegramUser } from 'telegram-login-button';

import { Text } from '../components/Themed';
import { authService } from '@/services/auth.service';

const LoginContainer = styled(Text)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
`;

export default function LoginPage(): React.ReactNode {
  const onTelegramAuth = useCallback((data: TelegramUser) => {
    authService
      .authTelegram(data)
      .then(() => {
        alert('Logged in!');
      })
      .catch(error => {
        alert(error);
      });
  }, []);

  return (
    <LoginContainer>
      <TelegramLoginButton botName='beznomera_bot' dataOnauth={onTelegramAuth} />
    </LoginContainer>
  );
}
