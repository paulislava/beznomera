import { useTheme as useThemeContext } from '@/context/Theme/Theme.context';

export const useTheme = () => {
  const themeContext = useThemeContext();

  return {
    ...themeContext
  };
}; 