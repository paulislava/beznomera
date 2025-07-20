'use client';

import React, { useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services';
import { TELEGRAM_BOT_NAME } from '@/utils/env';
import { initDataRaw } from '@telegram-apps/sdk-react';
import type { TelegramUser } from 'telegram-login-button';
import { TelegramLoginButtonWrapper } from '@/components/TelegramLoginButtonWrapper';

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const to = searchParams.get('to') || '/';

  const onTelegramAuth = useCallback(
    (data: TelegramUser) => {
      authService
        .authTelegram(data)
        .then(() => {
          router.replace(to);
        })
        .catch((error: Error) => {
          alert('Произошла ошибка при входе. Повторите попытку');
          console.error(error);
        });
    },
    [router, to]
  );

  useEffect(() => {
    // Проверяем, есть ли данные от Telegram Web App
    const initData = initDataRaw();

    if (initData) {
      authService
        .authTelegramWebApp({ data: initData })
        .then(() => {
          router.replace(to);
        })
        .catch((error: Error) => {
          alert('Произошла ошибка при входе. Повторите попытку.');
          console.error(error);
        });
    }
  }, [router, to]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-[#090633] via-[#05031C] to-[#090821]'>
      <div className='max-w-md w-full mx-4'>
        <div className='bg-white/10 backdrop-blur-lg rounded-lg p-8 shadow-xl border border-white/20'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-white mb-2'>BEZNOMERA</h1>
            <p className='text-white/80'>Войдите в систему</p>
          </div>

          <div className='space-y-4'>
            {TELEGRAM_BOT_NAME && (
              <TelegramLoginButtonWrapper botName={TELEGRAM_BOT_NAME} dataOnauth={onTelegramAuth} />
            )}

            <div className='text-center'>
              <p className='text-white/60 text-sm'>Войдите через Telegram для доступа к системе</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
