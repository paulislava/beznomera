import { FC } from 'react';
import { FileButton } from './FileButton';
import { FileFieldProps } from './FileButton.types';
import { useMergeErrors } from '@/utils/forms';

export const FileField: FC<FileFieldProps> = ({
  input,
  label,
  fileType,
  onChange,
  errors,
  meta
}) => {
  const finalErrors = useMergeErrors(meta, errors);

  return (
    <FileButton
      onUpload={input.onChange}
      onChange={onChange}
      value={input.value}
      fileType={fileType}
      label={label}
      errors={finalErrors}
    />
  );
};
