import React from 'react';
import { TextInput } from './TextInput';
import { FinalTextInputProps } from './TextInput.types';

export const FinalTextInput: React.FC<FinalTextInputProps> = ({ input, meta, ...props }) => {
  return (
    <TextInput
      value={input.value}
      onChange={input.onChange}
      touched={meta.touched}
      errorText={meta.error}
      {...props}
    />
  );
};

export default FinalTextInput;
