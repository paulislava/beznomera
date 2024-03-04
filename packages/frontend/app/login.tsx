import React, { useCallback } from 'react';
import TelegramLoginButton, { TelegramUser } from 'telegram-login-button';

import { Text, View } from '../components/Themed';
import { authService } from '@/services';
import withRouter, { WithRouterProps } from '@/utils/withRouter';
import env from '@/utils/env';
import { IS_WEB } from '@/constants/site';
import Button from '@/components/Button/Button';
import Head from 'expo-router/head';

const TELEGRAM_BOT_NAME = env('TELEGRAM_BOT_NAME');

function LoginPage({ router }: WithRouterProps): React.ReactNode {
  const onTelegramAuth = useCallback((data: TelegramUser) => {
    authService
      .authTelegram(data)
      .then(() => {
        router.replace('/');
      })
      .catch(error => {
        alert('Произошла ошибка при входе. Повторите попытку');
        console.error(error);
      });
  }, []);

  return (
    <View fullHeight center>
      <Head>
        <title>Вход</title>
      </Head>
      <Text>
        {TELEGRAM_BOT_NAME && IS_WEB && (
          <TelegramLoginButton botName={TELEGRAM_BOT_NAME} dataOnauth={onTelegramAuth} />
        )}
        {!IS_WEB && (
          <Button externalHref='https://oauth.telegram.org/auth?bot_id=6914096008&origin=http%3A%2F%2F127.0.0.1&embed=1&request_access=write&return_to=http%3A%2F%2F127.0.0.1%2Flogin'>
            Войти через Telegram
          </Button>
        )}
      </Text>
    </View>
  );
}

export default withRouter(LoginPage);
