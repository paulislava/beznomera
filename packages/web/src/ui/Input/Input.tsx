import { FC, useCallback } from 'react';
import * as S from './Input.styled';
import { DEFAULT_TEXTAREA_MAX_ROWS } from '@/helpers/constants';
import { InputMeta } from './Meta';
import { InputProps } from './Input.types';

const autoComplete = process.env.REACT_APP_AUTOCOMPLETE === '1';

export const Input: FC<InputProps> = ({
  label,
  required,
  minLength,
  maxLength,
  readOnly,
  disabled,
  placeholder,
  meta,
  className,
  rightContent,
  mask,
  type,
  name,
  center,
  errors,
  maxRows = DEFAULT_TEXTAREA_MAX_ROWS,
  hideMeta,
  onClick,
  onChange,
  onlyInput,
  height,
  onFocus,
  onBlur
}) => {
  const extractedProps = {
    required,
    minLength,
    maxLength,
    readOnly,
    disabled,
    name,
    onChange,
    onFocus,
    onBlur
  };

  const onInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (mask) {
        onChange?.(e.currentTarget.value);
      }
    },
    [onChange, mask]
  );
  return (
    <S.Container>
      {!onlyInput && <S.Label>{label}</S.Label>}
      <S.InputRow>
        <S.InputContainer className={className}>
          {type === 'textarea' ? (
            <S.Textarea
              placeholder={placeholder || label?.toString()}
              {...extractedProps}
              maxRows={maxRows}
            />
          ) : (
            <S.Input
              $center={center}
              mask={mask}
              placeholder={placeholder || label?.toString()}
              {...extractedProps}
              onClick={onClick}
              autoComplete={autoComplete ? undefined : 'off'}
              onInput={onInput}
              height={height}
            />
          )}
        </S.InputContainer>
        {rightContent}
      </S.InputRow>
      {!hideMeta && !onlyInput && <InputMeta meta={meta} errors={errors} />}
    </S.Container>
  );
};

export default Input;
