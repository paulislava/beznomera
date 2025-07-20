'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Перенаправляем на главную страницу, так как telegram-login-button
    // обрабатывает авторизацию автоматически
    router.replace('/');
  }, [router]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-[#090633] via-[#05031C] to-[#090821]'>
      <div className='max-w-md w-full mx-4'>
        <div className='bg-white/10 backdrop-blur-lg rounded-lg p-8 shadow-xl border border-white/20'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
            <h2 className='text-xl font-semibold text-white mb-2'>Перенаправление...</h2>
            <p className='text-white/60'>Пожалуйста, подождите</p>
          </div>
        </div>
      </div>
    </div>
  );
}
