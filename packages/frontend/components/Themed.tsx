/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import React from 'react';
import { ColorValue, Text as DefaultText, View as DefaultView } from 'react-native';
import Colors from '@/constants/Colors';

import { useColorScheme } from './useColorScheme';
import styled, { css } from 'styled-components/native';
import Svg, { Rect, Defs, Stop } from 'react-native-svg';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps &
  DefaultView['props'] & { fullHeight?: boolean; center?: boolean };

const StyledViewContainer = styled(DefaultView)<{
  $fullHeight?: boolean;
  $center?: boolean;
  $backgroundColor?: ColorValue;
}>`
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
  const theme = useColorScheme() ?? 'light';
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

const SvgContainer = styled(Svg)`
  position: absolute;
  width: 100%;
  height: 100%;
`;

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, fullHeight, center, children, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor });

  return (
    <StyledViewContainer
      $fullHeight={fullHeight}
      $center={center}
      style={[{ backgroundColor }, style]}
      {...otherProps}
    >
      <SvgContainer viewBox='0 0 100% 100%' fill='none'>
        <Rect width='100%' height='100%' fill='url(#paint0_linear_2005_86)' />
        <Defs>
          <linearGradient
            id='paint0_linear_2005_86'
            x1='180'
            y1='0'
            x2='180'
            y2='100%'
            gradientUnits='userSpaceOnUse'
          >
            <Stop stopColor='#090633' />
            <Stop offset='0.451264' stopColor='#05031C' />
            <Stop offset='1' />
          </linearGradient>
        </Defs>
      </SvgContainer>
      {children}
    </StyledViewContainer>
  );
}
