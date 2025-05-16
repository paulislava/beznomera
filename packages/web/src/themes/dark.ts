import { css } from 'styled-components';
import { mainBackgroundColor } from '@/themes/tokens';
import { Theme } from '@/context/Theme/Theme.context';

const secondaryBackground = '#2d303e';

type ThemeParam = string | undefined;

export const darkTheme = {
  name: 'dark' as Theme,
  bodyBackgroundColor: '#393C49',
  textColor: '#fff',
  labelColor: 'rgb(113, 142, 191)',
  TextL: '#000000',
  mainBackgroundColor: '#252836',
  secondaryBackground,
  scrollbarTrackColor: 'rgba(113, 142, 191, 0.5)',
  scrollbarThumbColor: 'rgba(113, 142, 191, 0.5)',
  scrollbarThumbHoverColor: 'rgb(113, 142, 191)',
  primaryColor: '#718EBF',
  calendar: {
    background: '#3a3c49',
    textColor: '#f2f2f2',
    arrowBackground: '#252836',
    activeBackground: '#718ebf'
  },
  sidebar: {
    menuLabelColor: '#718ebf',
    background: '#1f1d2b',
    menuItemBackground: '#252836',
    fillIconColor: undefined as ThemeParam,
    subItemColor: '#889898',
    lineColor: '#718ebf'
  },
  input: {
    background: '#2D303E'
  },
  select: {
    background: '#2D303E',
    optionColor: '#fff'
  },
  tableHeadingCellBackground: 'rgba(37, 40, 54, 0.85)',
  skeletonBackground: `radial-gradient(circle, rgb(63, 65, 74) 0%, rgb(29, 26, 43) 100%)`
};

export default css`
  :root {
    ${mainBackgroundColor.name}: rgb(37, 40, 54);
  }
`;
