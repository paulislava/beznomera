'use client';

import React, { Suspense, useCallback, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { userService, authService } from '@/services';
import { UserProfile } from '@shared/user/user.types';
import { LinkedAccount, OAuthProvider } from '@shared/auth/auth.types';
import { BACKEND_URL } from '@/utils/api-service';
import { Form } from '@/ui/FormContainer/FormContainer';
import FormField from '@/ui/FormField/FormField';
import { Button, Avatar, Chip } from '@heroui/react';
import { showErrorMessage } from '@/utils/messages';
import { clearStoredAuthToken } from '@/utils/auth-storage';
import { logout } from './actions';

const PROVIDER_LABELS: Record<OAuthProvider, string> = {
  [OAuthProvider.GOOGLE]: 'Google',
  [OAuthProvider.YANDEX]: 'Яндекс',
  [OAuthProvider.VK]: 'VK',
  [OAuthProvider.APPLE]: 'Apple'
};

const PROVIDER_COLORS: Record<OAuthProvider, string> = {
  [OAuthProvider.GOOGLE]: '#4285F4',
  [OAuthProvider.YANDEX]: '#FC3F1D',
  [OAuthProvider.VK]: '#0077FF',
  [OAuthProvider.APPLE]: '#000000'
};

function ProviderIcon({ provider }: { provider: OAuthProvider }) {
  if (provider === OAuthProvider.GOOGLE) {
    return (
      <svg width='16' height='16' viewBox='0 0 48 48'>
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
  if (provider === OAuthProvider.YANDEX) {
    return (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='#FC3F1D'>
        <path d='M13.643 23h-3.05v-9.464H8V23H4.957V1h5.107c4.118 0 6.307 2.042 6.307 5.626 0 2.632-1.286 4.4-3.603 5.37L17.043 23h-3.4zm-3.05-11.688h1.636c2.136 0 3.257-1.05 3.257-3.543 0-2.35-1.121-3.4-3.257-3.4h-1.636v6.943z' />
      </svg>
    );
  }
  if (provider === OAuthProvider.VK) {
    return (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='#0077FF'>
        <path d='M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.169-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.169.508.271.508.22 0 .407-.136.813-.542 1.253-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.762-.491h1.744c.525 0 .643.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.745-.576.745z' />
      </svg>
    );
  }
  return (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
      <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' />
    </svg>
  );
}

function LinkedAccountsSection({
  accounts,
  onUnlink
}: {
  accounts: LinkedAccount[];
  onUnlink: (provider: OAuthProvider) => Promise<void>;
}) {
  const [unlinking, setUnlinking] = useState<OAuthProvider | null>(null);
  const linkedProviders = new Set(accounts.map(a => a.provider));
  const backendBase = BACKEND_URL.replace(/\/api$/, '');

  const handleUnlink = useCallback(
    async (provider: OAuthProvider) => {
      setUnlinking(provider);
      try {
        await onUnlink(provider);
      } finally {
        setUnlinking(null);
      }
    },
    [onUnlink]
  );

  return (
    <div className='space-y-3'>
      {Object.values(OAuthProvider).map(provider => {
        const linked = accounts.find(a => a.provider === provider);
        const isLinked = linkedProviders.has(provider);

        return (
          <div
            key={provider}
            className='flex items-center justify-between p-3 rounded-lg border border-default-200'
          >
            <div className='flex items-center gap-3'>
              <div
                className='w-8 h-8 rounded-full flex items-center justify-center'
                style={{ background: `${PROVIDER_COLORS[provider]}20` }}
              >
                <ProviderIcon provider={provider} />
              </div>
              <div>
                <p className='text-sm font-medium'>{PROVIDER_LABELS[provider]}</p>
                {linked?.email && <p className='text-xs text-default-500'>{linked.email}</p>}
                {linked?.displayName && !linked.email && (
                  <p className='text-xs text-default-500'>{linked.displayName}</p>
                )}
              </div>
            </div>
            {isLinked ? (
              <Button
                size='sm'
                variant='flat'
                color='danger'
                isLoading={unlinking === provider}
                onPress={() => handleUnlink(provider)}
              >
                Отвязать
              </Button>
            ) : (
              <a
                href={`${backendBase}/auth/${provider === OAuthProvider.APPLE ? 'apple' : provider}`}
              >
                <Button size='sm' variant='flat' color='primary'>
                  Привязать
                </Button>
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProfileContent({ initialProfile }: { initialProfile: UserProfile }) {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const linkedStatus = searchParams.get('status');
  const linkedProvider = searchParams.get('provider');

  const reloadProfile = useCallback(async () => {
    try {
      const data = await userService.me();
      setProfile(data);
    } catch {
      showErrorMessage('Ошибка', 'Не удалось обновить профиль');
    }
  }, []);

  const handleProfileSave = useCallback(
    async (values: { firstName?: string; lastName?: string; nickname?: string }) => {
      setSaving(true);
      try {
        const updated = await userService.updateMe(values);
        setProfile(updated);
      } catch {
        showErrorMessage('Ошибка', 'Не удалось сохранить профиль');
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${BACKEND_URL}/user/me/avatar`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Upload failed');
      const data: { avatarUrl: string } = await res.json();
      setProfile(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
    } catch {
      showErrorMessage('Ошибка', 'Не удалось загрузить аватар');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  const handleAvatarDelete = useCallback(async () => {
    try {
      await userService.deleteAvatar();
      setProfile(prev => ({ ...prev, avatarUrl: undefined }));
    } catch {
      showErrorMessage('Ошибка', 'Не удалось удалить аватар');
    }
  }, []);

  const handleUnlink = useCallback(
    async (provider: OAuthProvider) => {
      try {
        await authService.unlinkProvider(provider);
        await reloadProfile();
      } catch {
        showErrorMessage('Ошибка', 'Не удалось отвязать аккаунт');
      }
    },
    [reloadProfile]
  );

  const initials =
    [profile.firstName?.[0], profile.lastName?.[0]].filter(Boolean).join('') ||
    profile.nickname?.[0]?.toUpperCase() ||
    '?';

  return (
    <div
      style={{ width: '100%', paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}
      className='mx-auto px-4 pt-8 space-y-8'
    >
      {linkedStatus === 'ok' && linkedProvider && (
        <Chip color='success' variant='flat'>
          Аккаунт {PROVIDER_LABELS[linkedProvider as OAuthProvider] ?? linkedProvider} успешно
          привязан
        </Chip>
      )}

      <h1 className='text-2xl font-bold'>Профиль</h1>

      <section className='flex items-center gap-6'>
        <div className='relative'>
          <Avatar
            src={profile.avatarUrl}
            name={initials}
            className='w-20 h-20 text-lg'
            isBordered
          />
          {avatarUploading && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/40 rounded-full'>
              <span className='text-white text-xs'>...</span>
            </div>
          )}
        </div>
        <div className='space-y-2'>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleAvatarChange}
          />
          <Button
            size='sm'
            variant='flat'
            onPress={() => fileInputRef.current?.click()}
            isLoading={avatarUploading}
          >
            Загрузить фото
          </Button>
          {profile.avatarUrl && (
            <Button size='sm' variant='flat' color='danger' onPress={handleAvatarDelete}>
              Удалить фото
            </Button>
          )}
        </div>
      </section>

      <section className='space-y-4'>
        <h2 className='text-lg font-semibold'>Личные данные</h2>
        <Form
          onSubmit={handleProfileSave}
          initialValues={{
            firstName: profile.firstName ?? '',
            lastName: profile.lastName ?? '',
            nickname: profile.nickname ?? ''
          }}
        >
          <FormField name='firstName' type='text' label='Имя' />
          <FormField name='lastName' type='text' label='Фамилия' />
          <FormField name='nickname' type='text' label='Никнейм' />
          <Button type='submit' color='primary' isLoading={saving}>
            Сохранить
          </Button>
        </Form>
      </section>

      {(profile.email || profile.tel) && (
        <section className='space-y-2'>
          <h2 className='text-lg font-semibold'>Контакты</h2>
          {profile.email && (
            <div className='flex items-center gap-2 text-sm text-default-600'>
              <span className='font-medium'>Email:</span>
              <span>{profile.email}</span>
            </div>
          )}
          {profile.tel && (
            <div className='flex items-center gap-2 text-sm text-default-600'>
              <span className='font-medium'>Телефон:</span>
              <span>{profile.tel}</span>
            </div>
          )}
        </section>
      )}

      <section className='space-y-4'>
        <h2 className='text-lg font-semibold'>Привязанные аккаунты</h2>
        <LinkedAccountsSection accounts={profile.linkedAccounts ?? []} onUnlink={handleUnlink} />
      </section>

      <div className='pt-2 border-t border-default-200'>
        <Button
          color='danger'
          variant='flat'
          className='w-full'
          onPress={() => {
            clearStoredAuthToken();
            logout();
          }}
        >
          Выйти
        </Button>
      </div>
    </div>
  );
}

export function ProfileClient({ initialProfile }: { initialProfile: UserProfile }) {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <ProfileContent initialProfile={initialProfile} />
    </Suspense>
  );
}
