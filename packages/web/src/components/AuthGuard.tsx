'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const { authorized, loading } = useAuth();

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-[#090633] via-[#05031C] to-[#090821]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
          <p className='text-white/60'>Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-[#090633] via-[#05031C] to-[#090821]'>
        <div className='text-center'>
          <p className='text-white/60'>Перенаправление на страницу входа...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
