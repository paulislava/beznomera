import { IMaskInput } from 'react-imask';
import styled, { css } from 'styled-components';
import { themeable } from '@/themes/utils';
import { Textarea as HeroTextarea, Input as HeroInput } from '@heroui/input';

export const inputContainerMixin = css<{ height?: number }>`
  /* Base / Dark Line */
  border: 1px solid rgb(57, 60, 73);
  border-radius: 8px;

  /* Base / Form BG */
  background: ${themeable('input.background')};
  padding: 14px;
  height: ${({ height }) => height ?? 50}px;
  color: inherit;

  font-size: 14px;
  line-height: 140%;
  width: 100%;
  box-sizing: border-box;
  cursor: inherit;

  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); // Легкая тень для кнопки
`;

export const Label = styled.div`
  color: ${themeable('textColor')};
  font-size: 14px;
  font-weight: 500;
  line-height: 130%;
`;

export const Container = styled.label`
  scroll-margin-top: 20px;
  display: flex;
  flex-flow: column;
  gap: 5px;
  width: 100%;
  position: relative;
  margin-bottom: 3px;
`;

export const MetaContainer = styled.div`
  margin-top: 6px;
  min-height: 15px;
  display: flex;
  flex-flow: column;
  gap: 4px;
`;

export const Meta = styled.div`
  font-size: 13px;

  display: flex;
  flex-flow: row;
  align-items: center;
  gap: 4px;
  color: #ff0000;

  &::before {
    content: 'ℹ';
  }
`;

export const InputRow = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-flow: row;
  align-items: center;
  gap: 20px;
`;

export const InputContainer = styled.div`
  flex: 1;
  position: relative;
  cursor: text;
`;

export const Textarea = styled(HeroTextarea)`
  backdrop-filter: blur(10px);
`;

export const Input = styled(HeroInput)<{
  $center?: boolean;
  height?: number;
}>`
  ${({ $center }) =>
    $center &&
    css`
      text-align: center;
    `}

  &::-webkit-inner-spin-button,
    &::-webkit-calendar-picker-indicator {
    display: none;
    -webkit-appearance: none;
  }
`;
