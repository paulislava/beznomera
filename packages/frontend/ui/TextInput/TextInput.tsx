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

export const TextInput: React.FC<TextInputProps> = ({ errorText, touched, onChange, ...props }) => {
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
        onChangeText={onChange}
        {...props}
      />
      {errorText && touched && <ErrorText>{errorText}</ErrorText>}
    </>
  );
};

export default TextInput;
