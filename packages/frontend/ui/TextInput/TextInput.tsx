import React from 'react';
import { TextInput as RawInput, TextInputProps } from 'react-native-paper';

import styled from 'styled-components/native';
import { Text } from '@/components/Themed';

export interface FormFieldProps extends Omit<TextInputProps, 'theme'> {
  touched?: boolean;
  errorText?: string;
}

const ErrorText = styled(Text)`
  color: red;
  font-size: 12px;
  margin-top: 4px;
`;

export const TextInput: React.FC<FormFieldProps> = ({ errorText, touched, ...props }) => {
  return (
    <>
      <RawInput
        mode='flat'
        outlineColor='white'
        textColor='#fff'
        activeUnderlineColor='#dbb3b3'
        style={{ backgroundColor: 'transparent', minHeight: '100%' }}
        underlineStyle={{ marginLeft: 16 }}
        contentStyle={{ paddingTop: 0, marginTop: 26 }}
        {...props}
      />
      {errorText && touched && <ErrorText>{errorText}</ErrorText>}
    </>
  );
};

export default TextInput;
