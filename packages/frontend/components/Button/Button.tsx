import React, { FC, useCallback } from 'react';
import { Text, Pressable, Platform } from 'react-native';

import * as WebBrowser from 'expo-web-browser';
import styled from 'styled-components/native';

interface ButtonProps {
  children?: React.ReactNode;
  externalHref?: string;
  onClick?(): void;
}

const StyledPressable = styled(Pressable)`
  border-radius: 35px;
  background: #00388b;
  color: white;
  height: max-content;
`;

const StyledText = styled(Text)`
  color: white;
  font-size: 17px;

  padding: 15px 25px;
  font-weight: 100;
`;

const Button: FC<ButtonProps> = ({ children, externalHref, onClick }) => {
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
    <StyledPressable onPress={handleClick}>
      <StyledText>{children}</StyledText>
    </StyledPressable>
  );
};

export default Button;
