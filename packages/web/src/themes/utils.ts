import { RuleSet } from 'styled-components';
import { ThemeValues } from './themes.types';

type ThemeProps = { theme: ThemeValues };

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

export const theme = {
  mainBackgroundColor: '#ffffff',
  scrollbarTrackColor: '#f1f1f1',
  scrollbarThumbColor: '#888888',
  scrollbarThumbHoverColor: '#555555'
  // другие переменные темы...
};
