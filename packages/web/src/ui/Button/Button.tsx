import React, { forwardRef, useCallback, useMemo, useState } from 'react';

import styled, { css } from 'styled-components';
import { ExternalLink } from '../../components/ExternalLink';

import { Glass } from '@/ui/Glass';
import { handleEvent } from '@/utils/log';
import { useColorScheme } from '@/components/useColorScheme';
import { RawLoading } from '@/components/Loading';
import { Button as RawButton } from '@heroui/react';

type ButtonView = 'primary' | 'secondary' | 'glass' | 'danger';

interface ButtonProps {
  children?: React.ReactNode;
  href?: string;
  disabled?: boolean;
  view?: ButtonView;
  onClick?(): any;
  event?: string;
  eventParams?: Record<string, string | number | undefined>;
  className?: string;
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

const StyledPressable = styled(RawButton)<{
  $view: ButtonView;
  $theme: ColorSchemeName;
  $fullWidth?: boolean;
}>`
  position: relative;
  cursor: pointer;
  border-radius: 35px;
  overflow: hidden;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'max-content')};

  /* Явно убираем все границы по умолчанию */
  border: none !important;
  outline: none !important;

  ${({ $view, $theme }) => {
    const config = getViewConfig($view);

    return css`
      background: ${config.background};
      color: ${typeof config.color === 'string' ? config.color : config.color[$theme ?? 'dark']};

      ${$view === 'glass' &&
      css`
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
      `}
    `;
  }}

  max-width: 300px;

  height: max-content;

  ${({ disabled }) =>
    disabled &&
    css`
      cursor: inherit;
      background: gray;
    `}
`;

const StyledText = styled.div<{ $visible: boolean }>`
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

const LoadingContainer = styled.div`
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

// eslint-disable-next-line react/display-name
export const Button = forwardRef<any, ButtonProps>(
  (
    {
      children,
      href: externalHref,
      onClick,
      disabled,
      view = 'primary',
      event,
      eventParams,
      className,
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
        className={className}
        onClick={handleClick}
      >
        {view === 'glass' && <Glass />}
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
