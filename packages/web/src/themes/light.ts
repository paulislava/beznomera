import { css } from 'styled-components';
import { ThemeValues } from './themes.types';
import { Theme } from '@/context/Theme/Theme.context';

const white = '#fff';

export const lightTheme: ThemeValues = {
  name: 'light' as Theme,
  bodyBackgroundColor: white,
  textColor: '#000000',
  labelColor: '#718EBF',

  mainBackgroundColor: '#F5F7FA',
  secondaryBackground: white,
  TextL: '#000000',
  scrollbarTrackColor: 'rgb(113, 142, 191)',
  scrollbarThumbColor: 'rgba(113, 142, 191, 0.5)',
  scrollbarThumbHoverColor: 'rgba(113, 142, 191, 0.5)',
  primaryColor: '#718EBF',
  select: {
    background: white,
    optionColor: '#889898'
  },
  calendar: {
    background: white,
    textColor: '#4F4F4F',
    arrowBackground: '#f2f2f2',
    activeBackground: '#5072A7'
  },
  sidebar: {
    menuLabelColor: white,
    background: '#5072A7',

    menuItemBackground: '#718EBF',
    fillIconColor: white,
    subItemColor: white,
    lineColor: white
  },
  input: {
    background: white
  },
  tableHeadingCellBackground: 'rgba(245, 247, 250, 0.85)',
  skeletonBackground: `radial-gradient(circle, rgba(165, 191, 233, 0.4) 0%, rgba(113, 142, 191) 100%)`,
  qrCodeFill: '#000'
};

export default css``;
