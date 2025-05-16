import React, { useMemo } from 'react';
import { FinalInputProps } from './Input.types';
import Input from './Input';

export const FinalInput: React.FC<FinalInputProps> = ({ input, meta, errors, ...props }) => {
  const finalErrors = useMemo(
    () => (meta.touched && !meta.dirtySinceLastSubmit ? errors : []),
    [meta.touched, meta.dirtySinceLastSubmit, errors]
  );

  return <Input {...input} errors={finalErrors} {...props} />;
};

export default FinalInput;
