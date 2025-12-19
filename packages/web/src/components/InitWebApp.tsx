'use client';

import { useEffect } from 'react';
import { initWebApp } from '@/utils/telegram';
import { usePathname, useRouter } from 'next/navigation';

export const InitWebApp = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (router) {
      initWebApp(router, pathname);
    }
  }, [router, pathname]);

  return null;
};
