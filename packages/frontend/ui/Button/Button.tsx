import React, { forwardRef, useCallback } from 'react';
import { Text, Pressable, StyleProp, ViewStyle } from 'react-native';

import styled, { css } from 'styled-components/native';
import { ExternalLink } from '../../components/ExternalLink';
import { isWeb } from '@/utils/env';
import { Glass } from '@/ui/Glass';
import { handleEvent } from '@/utils/log';

type ButtonView = 'primary' | 'secondary' | 'glass';

interface ButtonProps {
  children?: React.ReactNode;
  externalHref?: string;
  disabled?: boolean;
  view?: ButtonView;
  onClick?(): void;
  event?: string;
  eventParams?: Record<string, string | number | undefined>;
  style?: StyleProp<ViewStyle>;
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
  },
  glass: {
    background: `rgba(255, 255, 255, 0.1)`,
    color: '#fff'
  }
};

const getViewConfig = (view: ButtonView): ViewConfig => viewConfigs[view];

const StyledPressable = styled(Pressable)<{ $view: ButtonView }>`
  border-radius: 35px;
  overflow: hidden;

  ${({ $view }) => {
    const config = getViewConfig($view);

    return css`
      background: ${config.background};
      color: ${config.color};

      ${$view === 'glass' &&
      css`
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
      `}
    `;
  }}

  width: 100%;
  max-width: 300px;

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

export const Button = forwardRef<any, ButtonProps>(
  (
    { children, externalHref, onClick, disabled, view = 'primary', event, eventParams, style },
    ref
  ) => {
    const handleClick = useCallback(() => {
      onClick?.();
      if (event) {
        handleEvent(event, eventParams);
      }
    }, [onClick, event, eventParams]);

    const content = (
      <StyledPressable
        ref={ref}
        $view={view}
        disabled={disabled}
        style={style}
        onPress={handleClick}
      >
        {isWeb && view === 'glass' && <Glass />}
        <StyledText>{children}</StyledText>
      </StyledPressable>
    );

    if (externalHref) {
      return <ExternalLink href={externalHref}>{content}</ExternalLink>;
    }

    return content;
  }
);

export default Button;
