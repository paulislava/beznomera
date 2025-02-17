/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import React from 'react';
import { ColorValue, Text as DefaultText, View as DefaultView } from 'react-native';
import Colors from '@/constants/Colors';

import styled, { css } from 'styled-components/native';
import Svg, { Rect } from 'react-native-svg';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps &
  DefaultView['props'] & { fullHeight?: boolean; center?: boolean };

export const StyledViewContainer = styled(DefaultView)<{
  $fullHeight?: boolean;
  $center?: boolean;
  $backgroundColor?: ColorValue;
}>`
  position: relative;
  padding: 0 10px;

  ${({ $fullHeight }) =>
    $fullHeight &&
    css`
      flex: 1;
    `}

  ${({ $center }) =>
    $center &&
    css`
      align-items: center;
      justify-content: center;
    `}
`;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName?: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  // const theme = useColorScheme() ?? 'dark';
  const theme = 'dark';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else if (colorName) {
    return Colors[theme][colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export const TextL = styled(Text)`
  font-size: 18px;
`;

const SvgContainer = styled(Svg)`
  position: absolute;
  width: 100%;
  height: 100%;
`;

export function PageView(props: ViewProps) {
  const { style, lightColor, darkColor, fullHeight, center, children, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor });

  return (
    <>
      <SvgContainer fill='none'>
        <Rect width='100%' height='100%' fill='url(#paint0_linear_2005_86)' />
      </SvgContainer>{' '}
      <StyledViewContainer
        $fullHeight={fullHeight}
        $center={center}
        style={[{ backgroundColor }, style]}
        {...otherProps}
      >
        {children}
      </StyledViewContainer>
    </>
  );
}
