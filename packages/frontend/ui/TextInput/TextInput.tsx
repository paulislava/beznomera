import React from 'react';
import { TextInput as RawInput } from 'react-native-paper';

import styled from 'styled-components/native';
import { Text } from '@/components/Themed';
import { TextInputProps } from './TextInput.types';

const ErrorText = styled(Text)`
  color: red;
  font-size: 12px;
  margin-top: 4px;
`;

const StyledInput = styled(RawInput)`
  width: 100%;
  box-sizing: border-box;
  padding-right: 16px;
`;

export const TextInput: React.FC<TextInputProps> = ({
  errorText,
  touched,
  onChange,
  value,
  ...props
}) => {
  return (
    <>
      <StyledInput
        mode='flat'
        outlineColor='white'
        textColor='#fff'
        activeUnderlineColor='#dbb3b3'
        style={{ backgroundColor: 'transparent', minHeight: '100%' }}
        underlineStyle={{ marginLeft: 16, marginRight: 16 }}
        contentStyle={{ paddingTop: 0, marginTop: 26 }}
        onChangeText={onChange}
        value={value || undefined}
        {...props}
      />
      {errorText && touched && <ErrorText>{errorText}</ErrorText>}
    </>
  );
};

export default TextInput;
