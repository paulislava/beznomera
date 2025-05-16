import React, { useMemo } from 'react';
import { TextInput } from './TextInput';
import { FinalTextInputProps } from './TextInput.types';

export const FinalTextInput: React.FC<FinalTextInputProps> = ({
  input,
  meta,
  errors,
  ...props
}) => {
  const finalErrors = useMemo(
    () => (meta.touched && !meta.dirtySinceLastSubmit ? errors : []),
    [meta.touched, meta.dirtySinceLastSubmit, errors]
  );

  return (
    <TextInput value={input.value} onChange={input.onChange} errors={finalErrors} {...props} />
  );
};

export default FinalTextInput;
