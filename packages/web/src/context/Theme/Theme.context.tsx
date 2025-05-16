import { createContext, FC, useContext, useMemo, useState } from 'react';
import { ThemeProvider as StyledProvider } from 'styled-components';
import { darkTheme } from '@/themes/dark';
import { lightTheme } from '@/themes/light';
import { ThemeValues } from '@/themes/themes.types';

export type Theme = 'light' | 'dark';

export const DEFAULT_THEME: Theme = 'dark';

const THEME_LOCAL_STORAGE_KEY = 'theme';

type ThemeContextProps = { theme: ThemeValues; setTheme(theme: Theme): void };

export const ThemeContext = createContext<ThemeContextProps>({
  theme: darkTheme,
  setTheme: () => {
    return;
  }
});

export const ThemeProvider: FC<ChildrenProps> = ({ children }) => {
  const [value, setValue] = useState<Theme>(
    (localStorage.getItem(THEME_LOCAL_STORAGE_KEY) || DEFAULT_THEME) as Theme
  );

  const providerProps = useMemo<ThemeContextProps>(
    () => ({
      theme: value === 'dark' ? darkTheme : lightTheme,
      setTheme(theme: Theme) {
        setValue(theme);
        localStorage.setItem(THEME_LOCAL_STORAGE_KEY, theme);
      }
    }),
    [value]
  );

  return (
    <ThemeContext.Provider value={providerProps}>
      <StyledProvider theme={value === 'dark' ? darkTheme : lightTheme}>{children}</StyledProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext).theme;
