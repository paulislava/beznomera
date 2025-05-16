import { FC, useCallback, useContext } from 'react';
import RawFileButton from './RawFileButton';
import { FileButtonProps } from './FileButton.types';
import { FormContext } from '@/ui/FormContainer/FormContainer';
import { uploadFile } from '@/utils/files';
import { FileFolder } from '@shared/file/file.types';

export const FileButton: FC<FileButtonProps> = ({ onUpload, onError, onChange, ...rawProps }) => {
  const { loadingFiles } = useContext(FormContext);

  const handleChange = useCallback(
    (file: File | null) => {
      if (file) {
        onChange?.(file);

        loadingFiles.push(
          uploadFile(file, FileFolder.Temp)
            .then(data => {
              onUpload?.(data);
              return data;
            })
            .catch(err => {
              onError?.(err);
              throw err;
            })
        );
      }
    },
    [loadingFiles, onChange, onError, onUpload]
  );

  return <RawFileButton onChange={handleChange} {...rawProps} />;
};
