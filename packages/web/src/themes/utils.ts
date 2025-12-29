import { RuleSet } from 'styled-components';
import { ThemeValues } from './themes.types';
import { useTheme } from '@/context/Theme/Theme.context';

type ThemeProps = { theme: ThemeValues };

export const useThemeName = () => {
  const theme = useTheme();

  return theme.name === 'light' ? 'light' : 'dark';
};

/**
 * функция возвращает значение параметры темы из dark.ts (darkTheme)
 **/
export const themeable =
  (param: Leaves<ThemeValues>) =>
  ({ theme }: ThemeProps) =>
    param.includes('.')
      ? param.split('.').reduce<{ [key: string]: any }>((acc, key) => acc[key], theme)
      : theme[param as keyof ThemeValues];

/**
 * {@link import('./main.ts') link}
 */

export const forDarkTheme =
  (content: RuleSet<object>) =>
  ({ theme }: ThemeProps) =>
    theme.name === 'dark' && content;

export const forLightTheme =
  (content: RuleSet<object>) =>
  ({ theme }: ThemeProps) =>
    theme.name === 'light' && content;

export const forTheme =
  (lightContent: RuleSet<object>, darkContent: RuleSet<object>) =>
  ({ theme }: ThemeProps) =>
    theme.name === 'light' ? lightContent : darkContent;

export const forThemeValue =
  (lightContent: string | number, darkContent: string | number) =>
  ({ theme }: ThemeProps) =>
    theme.name === 'light' ? lightContent : darkContent;
