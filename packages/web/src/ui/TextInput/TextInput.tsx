import React, { useState, useCallback } from 'react';
import { TextInput as RawInput } from 'react-native-paper';
import styled from 'styled-components';
import { TextInputProps } from './TextInput.types';
import { TextInput as NativeTextInput } from 'react-native';
import { RenderProps } from 'react-native-paper/lib/typescript/components/TextInput/types';

const Container = styled.div`
  width: 100%;
  flex: 1;
`;

const ErrorText = styled.div`
  color: red;
  font-size: 12px;
  margin-top: 4px;
  margin-left: 16px;
`;

const StyledInput = styled(RawInput)`
  width: 100%;
  box-sizing: border-box;
  padding-right: 16px;
`;

const InputContainer = styled.div<{ $isRow?: boolean }>`
  flex-direction: ${({ $isRow }) => ($isRow ? 'row' : 'column')};
  align-items: center;
  padding-left: 16px;
  height: 100%;
`;

const BeforeText = styled.div<{ $theme: ColorSchemeName }>`
  color: ${({ $theme }) => ($theme === 'light' ? '#000' : '#fff')};
  margin: 26px 0 4px;
  font-size: 16px;
  line-height: 19.2px;
  font-family: Roboto;
`;

const RenderInput = styled(NativeTextInput)`
  flex: 1;

  width: 100%;
`;

export const TextInput: React.FC<TextInputProps> = ({
  errors,
  onChange,
  value,
  beforeText,
  onFocus,
  onBlur,
  placeholder,
  readOnly,
  rightContent,
  placeholderAsValue,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const theme = useColorScheme();

  const renderProps = useCallback(
    (inputProps: RenderProps) => (
      <InputContainer $isRow={Boolean(beforeText && (inputProps.value || isFocused))}>
        {beforeText && (inputProps.value || isFocused) && (
          <BeforeText $theme={theme}>{beforeText}</BeforeText>
        )}
        <RenderInput {...inputProps} />
      </InputContainer>
    ),
    [beforeText, isFocused, theme]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  return (
    <Container>
      <StyledInput
        mode='flat'
        outlineColor='white'
        textColor={theme === 'light' ? '#000' : '#fff'}
        activeUnderlineColor='#dbb3b3'
        style={{ backgroundColor: 'transparent', minHeight: '100%' }}
        underlineStyle={{ marginLeft: 16, marginRight: 16 }}
        contentStyle={{ paddingTop: 0, paddingLeft: 0, marginTop: 26, flex: 1 }}
        onChangeText={onChange}
        value={value ?? (placeholderAsValue ? placeholder : undefined)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
        render={renderProps}
        placeholder={placeholder}
        readOnly={readOnly}
      />
      {rightContent}
      {errors &&
        errors.length > 0 &&
        errors.map(error => <ErrorText key={error.code}>{error.message}</ErrorText>)}
    </Container>
  );
};

export default TextInput;
