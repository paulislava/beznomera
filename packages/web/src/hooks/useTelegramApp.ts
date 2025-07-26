'use client';

import { useState, useEffect } from 'react';
import { initDataRaw } from '@telegram-apps/sdk-react';

export const useTelegramApp = () => {
  const [isTelegramApp, setIsTelegramApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTelegramApp = () => {
      try {
        const initData = initDataRaw();
        const hasInitData = !!initData;

        // Проверяем также по user agent и другим признакам
        const isInTelegram =
          !!(window as any).Telegram?.WebApp ||
          window.location.href.includes('tgWebAppData') ||
          hasInitData;

        setIsTelegramApp(isInTelegram);
      } catch (error) {
        console.error('Error checking Telegram app:', error);
        setIsTelegramApp(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkTelegramApp();
  }, []);

  return {
    isTelegramApp,
    isLoading
  };
}; 