import React, { useCallback } from 'react';
import TelegramLoginButton, { TelegramUser } from 'telegram-login-button';

import { Text, PageView } from '../components/Themed';
import { authService } from '@/services';
import withRouter, { WithRouterProps } from '@/utils/withRouter';
import { isWeb, TELEGRAM_BOT_NAME } from '@/utils/env';
import Button from '@/ui/Button/Button';
import Head from 'expo-router/head';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';

import { initDataRaw } from '@telegram-apps/sdk-react';

function LoginPage({ router }: WithRouterProps): React.ReactNode {
  const { to } = useLocalSearchParams<{ to: string }>();

  const onTelegramAuth = useCallback((data: TelegramUser) => {
    authService
      .authTelegram(data)
      .then(() => {
        router.replace((to as any) ?? '/');
      })
      .catch((error: Error) => {
        alert('Произошла ошибка при входе. Повторите попытку');
        console.error(error);
      });
  }, []);

  useFocusEffect(() => {
    const initData = initDataRaw();

    if (initData) {
      authService
        .authTelegramWebApp({ data: initData })
        .then(() => {
          router.replace((to as any) ?? '/');
        })
        .catch((error: Error) => {
          alert(`Произошла ошибка при входе. Повторите попытку.`);
          console.error(error);
        });
    }
  });

  return (
    <PageView fullHeight center>
      <Head>
        <title>Вход</title>
      </Head>
      <Text>
        {TELEGRAM_BOT_NAME && isWeb && (
          <TelegramLoginButton botName={TELEGRAM_BOT_NAME} dataOnauth={onTelegramAuth} />
        )}
        {!isWeb && (
          <Button externalHref='https://oauth.telegram.org/auth?bot_id=6914096008&origin=http%3A%2F%2F127.0.0.1&embed=1&request_access=write&return_to=http%3A%2F%2F127.0.0.1%2Flogin'>
            Войти через Telegram
          </Button>
        )}
      </Text>
    </PageView>
  );
}

export default withRouter(LoginPage);
