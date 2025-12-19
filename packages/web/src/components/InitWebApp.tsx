'use client';

import { useEffect } from 'react';
import { initWebApp } from '@/utils/telegram';
import { useRouter } from 'next/navigation';

export const InitWebApp = () => {
  const router = useRouter();

  useEffect(() => {
    if (router) {
      initWebApp(router);
    }
  }, [router]);

  return null;
};
