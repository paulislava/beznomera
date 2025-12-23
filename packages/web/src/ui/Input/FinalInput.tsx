import React from 'react';
import { FinalInputProps } from './Input.types';
import Input from './Input';
import { useMergeErrors } from '@/utils/forms';

export const FinalInput: React.FC<FinalInputProps> = ({ input, meta, errors, ...props }) => {
  const finalErrors = useMergeErrors(meta, errors);
  return <Input {...input} errors={finalErrors} {...props} />;
};

export default FinalInput;
