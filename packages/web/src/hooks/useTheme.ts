import { useTheme as useThemeContext } from '@/context/Theme/Theme.context';
import { useEffect } from 'react';

export const useTheme = () => {
  const themeContext = useThemeContext();

  return {
    ...themeContext
  };
};

export const useThemeSync = () => {
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
};
