/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import React from 'react';

import Colors from '@/constants/Colors';
import styled, { css } from 'styled-components';
import { useColorScheme } from './useColorScheme';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & ChildrenProps;
export type ViewProps = ThemeProps & { fullHeight?: boolean; center?: boolean } & ChildrenProps;

export const StyledViewContainer = styled.div<{
  $fullHeight?: boolean;
  $center?: boolean;
  $backgroundColor?: string;
}>`
  z-index: 1;
  max-width: 600px;
  margin: auto;
  min-height: 100%;
  width: 100%;
  padding: 20px 10px;

  ${({ $center }) =>
    $center &&
    css`
      align-items: center;
      justify-content: center;
    `}

  ${({ $fullHeight }) =>
    $fullHeight &&
    css`
      flex: 1;
    `}
`;

const ScrollableContainer = styled.div`
  align-items: center;
  display: block;
  flex: 1;
`;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName?: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme();

  if (!theme) {
    return null;
  }

  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else if (colorName) {
    return Colors[theme][colorName];
  }
}

const RawText = styled.div<{ color?: Maybe<string> }>`
  color: ${({ color }) => color};
`;

export function Text(props: TextProps) {
  const { lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <RawText color={color} {...otherProps} />;
}

export const TextL = styled.div`
  font-size: 18px;
`;

const SvgContainer = styled.svg`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: -1;
`;

export function PageView(props: ViewProps) {
  const { fullHeight, center, children, ...otherProps } = props;
  const theme = useColorScheme();

  return (
    <>
      {theme === 'dark' && (
        <SvgContainer fill='none'>
          <rect width='100%' height='100%' fill='url(#paint0_linear_2005_86)' />
        </SvgContainer>
      )}
      <ScrollableContainer>
        <StyledViewContainer $fullHeight={fullHeight} $center={center} {...otherProps}>
          {children}
        </StyledViewContainer>
      </ScrollableContainer>
    </>
  );
}
