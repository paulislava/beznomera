import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { Text, Pressable, StyleProp, ViewStyle, ColorSchemeName, View } from 'react-native';

import styled, { css } from 'styled-components/native';
import { ExternalLink } from '../../components/ExternalLink';
import { isWeb } from '@/utils/env';
import { Glass } from '@/ui/Glass';
import { handleEvent } from '@/utils/log';
import { useColorScheme } from '@/components/useColorScheme';
import { RawLoading } from '@/components/Loading';

type ButtonView = 'primary' | 'secondary' | 'glass' | 'danger';

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
  fullWidth?: boolean;
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
  },
  danger: {
    background: '#ff0000',
    color: '#fff'
  }
};

const getViewConfig = (view: ButtonView): ViewConfig => viewConfigs[view];

const StyledPressable = styled(Pressable)<{
  $view: ButtonView;
  $theme: ColorSchemeName;
  $fullWidth?: boolean;
}>`
  border-radius: 35px;
  overflow: hidden;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'max-content')};

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

const StyledLink = styled(ExternalLink)<{ $fullWidth?: boolean }>`
  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      width: 100%;
    `}
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
      noFollowNoIndex,
      fullWidth
    },
    ref
  ) => {
    const theme = useColorScheme();
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = useCallback(async () => {
      if (isLoading) {
        return;
      }

      if (event) {
        handleEvent(event, eventParams);
      }

      const click = onClick?.();

      const isPromise = click instanceof Promise;

      if (isPromise) {
        setIsLoading(true);
        await click.finally(() => setIsLoading(false));
      }
    }, [onClick, event, eventParams, isLoading]);

    const viewConfig = useMemo(() => getViewConfig(view), [view]);

    const content = (
      <StyledPressable
        $theme={theme}
        $fullWidth={fullWidth}
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
            <RawLoading
              size={25}
              color={
                typeof viewConfig.color === 'string'
                  ? viewConfig.color
                  : viewConfig.color[theme ?? 'dark']
              }
            />
          </LoadingContainer>
        )}
      </StyledPressable>
    );

    if (externalHref) {
      return (
        <StyledLink
          href={externalHref}
          rel={noFollowNoIndex ? 'nofollow noopener noreferrer' : ''}
          $fullWidth={fullWidth}
        >
          {content}
        </StyledLink>
      );
    }

    return content;
  }
);

export default Button;
