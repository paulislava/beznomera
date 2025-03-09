/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import React from 'react';
import {
  ColorValue,
  Text as DefaultText,
  View as DefaultView,
  ScrollView,
  useColorScheme
} from 'react-native';
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

const ScrollableContainer = styled(ScrollView).attrs({
  // @ts-expect-error TODO: Найти альтернативу для display:
  contentContainerStyle: {
    flex: 1,
    alignItems: 'center',
    display: 'block'
  }
})`
  flex: 1;
`;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName?: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'dark';
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
  z-index: -1;
`;

export function PageView(props: ViewProps) {
  const { style, lightColor, darkColor, fullHeight, center, children, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor });

  return (
    <>
      <SvgContainer fill='none'>
        <Rect width='100%' height='100%' fill='url(#paint0_linear_2005_86)' />
      </SvgContainer>
      <ScrollableContainer>
        <StyledViewContainer
          $fullHeight={fullHeight}
          $center={center}
          style={[{ backgroundColor }, style]}
          {...otherProps}
        >
          {children}
        </StyledViewContainer>
      </ScrollableContainer>
    </>
  );
}
