'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services';
import { TELEGRAM_BOT_NAME } from '@/utils/env';
import { initData } from '@telegram-apps/sdk-react';
import type { TelegramUser } from 'telegram-login-button';
import { TelegramLoginButtonWrapper } from '@/components/TelegramLoginButtonWrapper';
import { showErrorMessage } from '@/utils/messages';
import { isTelegramWebApp } from '@/utils/telegram';
import { setStoredAuthToken } from '@/utils/auth-storage';
import { BACKEND_URL } from '@/utils/api-service';
import { AuthMode } from '@shared/auth/auth.types';
import { Form } from '@/ui/FormContainer/FormContainer';
import FormField from '@/ui/FormField/FormField';
import { Button, Divider } from '@heroui/react';

type EmailStep = 'email' | 'code';

function SocialButton({
  href,
  icon,
  label
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a href={href} className='w-full'>
      <Button
        variant='bordered'
        className='w-full border-default-200 text-default-700 hover:border-default-400 dark:border-white/30 dark:text-white'
        startContent={icon}
      >
        {label}
      </Button>
    </a>
  );
}

function GoogleIcon() {
  return (
    <svg width='18' height='18' viewBox='0 0 48 48'>
      <path
        fill='#4285F4'
        d='M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z'
      />
      <path
        fill='#34A853'
        d='M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z'
      />
      <path
        fill='#FBBC05'
        d='M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z'
      />
      <path
        fill='#EA4335'
        d='M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z'
      />
    </svg>
  );
}

function YandexIcon() {
  return (
    <svg width='18' height='18' viewBox='0 0 24 24' fill='#FC3F1D'>
      <path d='M13.643 23h-3.05v-9.464H8V23H4.957V1h5.107c4.118 0 6.307 2.042 6.307 5.626 0 2.632-1.286 4.4-3.603 5.37L17.043 23h-3.4zm-3.05-11.688h1.636c2.136 0 3.257-1.05 3.257-3.543 0-2.35-1.121-3.4-3.257-3.4h-1.636v6.943z' />
    </svg>
  );
}

function VkIcon() {
  return (
    <svg width='18' height='18' viewBox='0 0 24 24' fill='#0077FF'>
      <path d='M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.169-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.169.508.271.508.22 0 .407-.136.813-.542 1.253-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.762-.491h1.744c.525 0 .643.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.745-.576.745z' />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width='18' height='18' viewBox='0 0 24 24' fill='currentColor'>
      <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' />
    </svg>
  );
}

function EmailOtpForm({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<EmailStep>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = useCallback(async (values: { email: string }) => {
    setLoading(true);
    try {
      await authService.authStart({
        identifier: values.email,
        authMode: AuthMode.EMAIL,
        allowRegistration: true
      });
      setEmail(values.email);
      setStep('code');
    } catch {
      showErrorMessage('Ошибка', 'Не удалось отправить код. Проверьте адрес почты.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCodeSubmit = useCallback(
    async (values: { code: string }) => {
      setLoading(true);
      try {
        await authService.authFinish({
          identifier: email,
          authMode: AuthMode.EMAIL,
          code: values.code
        });
        onSuccess();
      } catch {
        showErrorMessage('Ошибка', 'Неверный код. Попробуйте ещё раз.');
      } finally {
        setLoading(false);
      }
    },
    [email, onSuccess]
  );

  if (step === 'code') {
    return (
      <div className='space-y-3'>
        <p className='text-default-500 dark:text-white/70 text-sm text-center'>
          Код отправлен на{' '}
          <span className='text-default-900 dark:text-white font-medium'>{email}</span>
        </p>
        <Form onSubmit={handleCodeSubmit}>
          <FormField name='code' type='text' label='Код подтверждения' required />
          <Button type='submit' color='primary' className='w-full' isLoading={loading}>
            Войти
          </Button>
        </Form>
        <button
          className='text-default-400 text-xs underline w-full text-center'
          onClick={() => setStep('email')}
        >
          Изменить email
        </button>
      </div>
    );
  }

  return (
    <Form onSubmit={handleEmailSubmit}>
      <FormField name='email' type='email' label='Email' required />
      <Button type='submit' color='primary' className='w-full' isLoading={loading}>
        Получить код
      </Button>
    </Form>
  );
}

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const to = searchParams.get('to') || '/';

  const onSuccess = useCallback(() => {
    router.replace(to);
  }, [router, to]);

  const onTelegramAuth = useCallback(
    (data: TelegramUser) => {
      authService
        .authTelegram(data)
        .then(token => {
          if (token) setStoredAuthToken(token);
          router.replace(to);
        })
        .catch((error: Error) => {
          showErrorMessage('Ошибка входа', 'Произошла ошибка при входе. Повторите попытку');
          console.error(error);
        });
    },
    [router, to]
  );

  useEffect(() => {
    if (!isTelegramWebApp) {
      return;
    }

    initData.restore();

    const raw = initData.raw();

    if (raw) {
      authService
        .authTelegramWebApp({ data: raw })
        .then(token => {
          if (token) setStoredAuthToken(token);
          router.replace(to);
        })
        .catch(() => {
          showErrorMessage('Ошибка входа', 'Произошла ошибка при входе. Повторите попытку.');
        });
    }
  }, [router, to]);

  const backendBase = BACKEND_URL.replace(/\/api$/, '');

  return (
    <div className='max-w-sm w-full mx-4'>
      <div className='bg-white dark:bg-white/10 dark:backdrop-blur-lg rounded-2xl p-8 shadow-sm border border-default-100 dark:border-white/20'>
        <div className='text-center mb-8'>
          <h1 className='text-2xl font-bold text-default-900 dark:text-white mb-1'>Beznomera</h1>
          <p className='text-default-400 dark:text-white/70 text-sm'>Войдите в аккаунт</p>
        </div>

        <div className='space-y-3'>
          {TELEGRAM_BOT_NAME && (
            <TelegramLoginButtonWrapper botName={TELEGRAM_BOT_NAME} dataOnauth={onTelegramAuth} />
          )}

          <div className='grid grid-cols-2 gap-2'>
            <SocialButton
              href={`${backendBase}/auth/google`}
              icon={<GoogleIcon />}
              label='Google'
            />
            <SocialButton
              href={`${backendBase}/auth/yandex`}
              icon={<YandexIcon />}
              label='Яндекс'
            />
            <SocialButton href={`${backendBase}/auth/vk`} icon={<VkIcon />} label='VK' />
            <SocialButton href={`${backendBase}/auth/apple`} icon={<AppleIcon />} label='Apple' />
          </div>

          <div className='flex items-center gap-3 py-1'>
            <Divider className='flex-1' />
            <span className='text-default-400 dark:text-white/50 text-xs'>или по email</span>
            <Divider className='flex-1' />
          </div>

          <EmailOtpForm onSuccess={onSuccess} />
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
