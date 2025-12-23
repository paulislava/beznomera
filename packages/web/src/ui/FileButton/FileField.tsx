import { FC } from 'react';
import { FileButton } from './FileButton';
import { FileFieldProps } from './FileButton.types';
import { useMergeErrors } from '@/utils/forms';

export const FileField: FC<FileFieldProps> = ({ input, onChange, errors, meta, ...props }) => {
  const finalErrors = useMergeErrors(meta, errors);

  return (
    <FileButton
      onUpload={input.onChange}
      onChange={onChange}
      value={input.value}
      errors={finalErrors}
      {...props}
    />
  );
};
