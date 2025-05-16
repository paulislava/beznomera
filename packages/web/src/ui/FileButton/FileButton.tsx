import { FC, useCallback, useContext } from 'react';
import RawFileButton from './RawFileButton';
import { uploadFile } from 'api/file/file';
import { FileButtonProps } from './FileButton.types';
import { FormContext } from 'ui/FormContainer/FormContainer';

export const FileButton: FC<FileButtonProps> = ({ onUpload, onError, onChange, ...rawProps }) => {
  const { loadingFiles } = useContext(FormContext);

  const handleChange = useCallback(
    (file: File | null) => {
      if (file) {
        onChange?.(file);

        loadingFiles.push(
          new Promise((resolve, reject) => {
            uploadFile(file)(
              ({ data }) => {
                if (data) {
                  onUpload(data);

                  resolve(data);
                } else {
                  reject('Error while uploading file!');
                }
              },
              err => {
                onError?.(err);
                reject(err);
              }
            );
          })
        );
      }
    },
    [loadingFiles, onChange, onError, onUpload]
  );

  return <RawFileButton onChange={handleChange} {...rawProps} />;
};
