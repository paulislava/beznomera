'use client';

import { useEffect } from 'react';
import { initWebApp } from '@/utils/telegram';

export const InitWebApp = () => {
  useEffect(() => {
    initWebApp();
  }, []);
};
