import React, { useMemo } from 'react';
import { FinalInputProps } from './Input.types';
import Input from './Input';
import { SubmissionError, ValidationCode } from '@shared/errors';

export const FinalInput: React.FC<FinalInputProps> = ({ input, meta, errors, ...props }) => {
  const finalErrors = useMemo(() => {
    if (!meta.touched || meta.dirtySinceLastSubmit) {
      return [];
    }

    const res: SubmissionError[] = errors || [];

    if (meta.submitError) {
      res.push(...meta.submitError);
    }

    if (meta.error) {
      res.push({ message: meta.error, code: ValidationCode.UNKNOWN });
    }

    return res;
  }, [meta.touched, meta.dirtySinceLastSubmit, meta.submitError, meta.error, errors]);

  return <Input {...input} errors={finalErrors} {...props} />;
};

export default FinalInput;
