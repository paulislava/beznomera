import React, { forwardRef, useCallback, useState } from 'react';
import { Text, Pressable, StyleProp, ViewStyle, ColorSchemeName, View } from 'react-native';

import styled, { css } from 'styled-components/native';
import { ExternalLink } from '../../components/ExternalLink';
import { isWeb } from '@/utils/env';
import { Glass } from '@/ui/Glass';
import { handleEvent } from '@/utils/log';
import { useColorScheme } from '@/components/useColorScheme';
import { Loading } from '@/components/Loading';
type ButtonView = 'primary' | 'secondary' | 'glass';

interface ButtonProps {
  children?: React.ReactNode;
  externalHref?: string;
  disabled?: boolean;
  view?: ButtonView;
  onClick?(): void | Promise<void>;
  event?: string;
  eventParams?: Record<string, string | number | undefined>;
  style?: StyleProp<ViewStyle>;
  noFollowNoIndex?: boolean;
}

type ViewConfig = {
  background: string;
  color: string | { light: string; dark: string };
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
    color: { light: '#000', dark: '#fff' }
  }
};

const getViewConfig = (view: ButtonView): ViewConfig => viewConfigs[view];

const StyledPressable = styled(Pressable)<{ $view: ButtonView; $theme: ColorSchemeName }>`
  border-radius: 35px;
  overflow: hidden;

  ${({ $view, $theme }) => {
    const config = getViewConfig($view);

    return css`
      background: ${config.background};
      color: ${typeof config.color === 'string' ? config.color : config.color[$theme ?? 'dark']};

      ${$view === 'glass' &&
      css`
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
      `}
    `;
  }}

  max-width: 300px;

  height: max-content;

  ${({ disabled }) =>
    disabled &&
    css`
      background: gray;
    `}
`;

const StyledText = styled(Text)<{ $visible: boolean }>`
  color: inherit;
  font-size: 17px;

  text-align: center;

  padding: 15px 25px;
  font-weight: 100;

  ${({ $visible }) =>
    !$visible &&
    css`
      visibility: hidden;
    `}
`;

const LoadingContainer = styled(View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
`;

export const Button = forwardRef<any, ButtonProps>(
  (
    {
      children,
      externalHref,
      onClick,
      disabled,
      view = 'primary',
      event,
      eventParams,
      style,
      noFollowNoIndex
    },
    ref
  ) => {
    const theme = useColorScheme();
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = useCallback(async () => {
      if (event) {
        handleEvent(event, eventParams);
      }

      const click = onClick?.();

      const isPromise = click instanceof Promise;

      if (isPromise) {
        setIsLoading(true);
        await click;
        setIsLoading(false);
      }
    }, [onClick, event, eventParams]);

    const content = (
      <StyledPressable
        $theme={theme}
        ref={ref}
        $view={view}
        disabled={disabled}
        style={style}
        onPress={handleClick}
      >
        {isWeb && view === 'glass' && <Glass />}
        <StyledText $visible={!isLoading}>{children}</StyledText>

        {isLoading && (
          <LoadingContainer>
            <Loading size={25} />
          </LoadingContainer>
        )}
      </StyledPressable>
    );

    if (externalHref) {
      return (
        <ExternalLink
          href={externalHref}
          rel={noFollowNoIndex ? 'nofollow noopener noreferrer' : ''}
        >
          {content}
        </ExternalLink>
      );
    }

    return content;
  }
);

export default Button;
