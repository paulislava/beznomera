import { ThemeValues } from '../themes/themes.types';

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface DefaultTheme extends ThemeValues {}
}
