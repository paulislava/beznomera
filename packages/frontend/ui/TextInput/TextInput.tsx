import React from 'react';
import { TextInput as RawInput } from 'react-native-paper';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { Text } from '@/components/Themed';
import { TextInputProps } from './TextInput.types';
import { TextInput as NativeTextInput } from 'react-native';

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

const InputContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  padding-left: 16px;
`;

const BeforeText = styled(Text)`
  color: #fff;
  margin: 26px 0 4px;
  font-size: 16px;
  line-height: 19.2px;
  font-family: Roboto;
`;

const RenderInput = styled(NativeTextInput)``;

export const TextInput: React.FC<TextInputProps> = ({
  errorText,
  touched,
  onChange,
  value,
  beforeText,
  ...props
}) => {
  const renderProps = (inputProps: any) => (
    <InputContainer>
      {beforeText && <BeforeText>{beforeText}</BeforeText>}
      <RenderInput {...inputProps} />
    </InputContainer>
  );

  return (
    <>
      <StyledInput
        mode='flat'
        outlineColor='white'
        textColor='#fff'
        activeUnderlineColor='#dbb3b3'
        style={{ backgroundColor: 'transparent', minHeight: '100%' }}
        underlineStyle={{ marginLeft: 16, marginRight: 16 }}
        contentStyle={{ paddingTop: 0, paddingLeft: 0, marginTop: 26 }}
        onChangeText={onChange}
        value={value ?? (beforeText ? '\u200B' : undefined)}
        {...props}
        render={renderProps}
      />
      {errorText && touched && <ErrorText>{errorText}</ErrorText>}
    </>
  );
};

export default TextInput;
