import { createContext, FC, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider as StyledProvider } from 'styled-components';
import { darkTheme } from '@/themes/dark';
import { lightTheme } from '@/themes/light';
import { ThemeValues } from '@/themes/themes.types';

export type Theme = 'light' | 'dark' | 'system';

export const DEFAULT_THEME: Theme = 'system';

const THEME_LOCAL_STORAGE_KEY = 'theme';
const THEME_LOCAL_STORAGE_KEY_MANUAL = 'theme_manual';

type ThemeContextProps = { theme: ThemeValues; setTheme(theme: Theme): void };

export const ThemeContext = createContext<ThemeContextProps>({
  theme: darkTheme,
  setTheme: () => {
    return;
  }
});

const setThemeIfNotManual = (theme: Theme) => {
  // const isManual = localStorage.getItem(THEME_LOCAL_STORAGE_KEY_MANUAL) === '1';

  // if (!isManual) {
  //   localStorage.setItem(THEME_LOCAL_STORAGE_KEY, theme);
  // }

  return theme;
};

export const ThemeProvider: FC<ChildrenProps> = ({ children }) => {
  const [value, setValue] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage?.getItem(THEME_LOCAL_STORAGE_KEY) || DEFAULT_THEME) as Theme;
    }
    return DEFAULT_THEME;
  });

  // Определяем системную тему
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';

      setSystemTheme(newTheme);
      setThemeIfNotManual(newTheme);
    };

    const theme = mediaQuery.matches ? 'dark' : 'light';

    setThemeIfNotManual(theme);

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Определяем активную тему
  const activeTheme = value === 'system' ? systemTheme : value;

  // Обновляем класс на html элементе
  useEffect(() => {
    const html = document.documentElement;

    // Удаляем все классы тем
    html.classList.remove('light', 'dark');

    // Добавляем класс текущей темы
    if (activeTheme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.add('light');
    }
  }, [activeTheme]);

  const providerProps = useMemo<ThemeContextProps>(
    () => ({
      theme: activeTheme === 'dark' ? darkTheme : lightTheme,
      setTheme(theme: Theme) {
        setValue(theme);
        if (typeof window !== 'undefined') {
          localStorage.setItem(THEME_LOCAL_STORAGE_KEY, theme);
          localStorage.setItem(THEME_LOCAL_STORAGE_KEY_MANUAL, '1');
        }
      }
    }),
    [activeTheme]
  );

  return (
    <ThemeContext.Provider value={providerProps}>
      <StyledProvider theme={activeTheme === 'dark' ? darkTheme : lightTheme}>
        {children}
      </StyledProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  return context.theme;
};
