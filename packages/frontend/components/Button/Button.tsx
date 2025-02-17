import React, { FC, forwardRef, useCallback } from 'react';
import { Text, Pressable, Platform } from 'react-native';

import * as WebBrowser from 'expo-web-browser';
import styled, { css } from 'styled-components/native';

type ButtonView = 'primary' | 'secondary';

interface ButtonProps {
  children?: React.ReactNode;
  externalHref?: string;
  disabled?: boolean;
  view?: ButtonView;
  onClick?(): void;
}
type ViewConfig = {
  background: string;
  color: string;
};

const viewConfigs: Record<ButtonView, ViewConfig> = {
  primary: {
    background: '#00388b',
    color: '#fff'
  },
  secondary: {
    background: '#e5e5e5',
    color: '#000'
  }
};

const getViewConfig = (view: ButtonView): ViewConfig => viewConfigs[view];

const StyledPressable = styled(Pressable)<{ $view: ButtonView }>`
  border-radius: 35px;
  ${({ $view }) => {
    const config = getViewConfig($view);

    return css`
      background: ${config.background};
      color: ${config.color};
    `;
  }}

  height: max-content;

  ${({ disabled }) =>
    disabled &&
    css`
      background: gray;
    `}
`;

const StyledText = styled(Text)`
  color: inherit;
  font-size: 17px;

  text-align: center;

  padding: 15px 25px;
  font-weight: 100;
`;

const Button = forwardRef<any, ButtonProps>(
  ({ children, externalHref, onClick, disabled, view = 'primary' }, ref) => {
    const handleClick = useCallback(() => {
      onClick?.();

      if (externalHref) {
        if (Platform.OS !== 'web') {
          // Open the link in an in-app browser.
          WebBrowser.openBrowserAsync(externalHref);
        }
      }
    }, [externalHref, onClick]);

    return (
      <StyledPressable ref={ref} $view={view} disabled={disabled} onPress={handleClick}>
        <StyledText>{children}</StyledText>
      </StyledPressable>
    );
  }
);

export default Button;
