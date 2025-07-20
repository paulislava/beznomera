'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { TelegramUser } from 'telegram-login-button';

interface TelegramLoginButtonWrapperProps {
  botName: string;
  dataOnauth: (data: TelegramUser) => void;
}

// Динамический импорт для TelegramLoginButton
const TelegramLoginButton = dynamic(() => import('telegram-login-button'), { ssr: false });

export const TelegramLoginButtonWrapper: React.FC<TelegramLoginButtonWrapperProps> = ({
  botName,
  dataOnauth
}) => {
  return (
    <div className='flex justify-center'>
      <TelegramLoginButton botName={botName} dataOnauth={dataOnauth} />
    </div>
  );
};
