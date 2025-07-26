'use client';

import { useEffect } from 'react';
import { useTheme } from '@/context/Theme/Theme.context';

interface ThemeSyncProps {
  children: React.ReactNode;
}

export const ThemeSync = ({ children }: ThemeSyncProps) => {
  const theme = useTheme();

  useEffect(() => {
    const html = document.documentElement;

    // Удаляем все классы тем
    html.classList.remove('light', 'dark');

    // Добавляем класс текущей темы
    if (theme.name === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.add('light');
    }
  }, [theme.name]);

  return <>{children}</>;
}; 