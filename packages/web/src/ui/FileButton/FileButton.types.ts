import { FileFolder, FileInfo } from '@shared/file/file.types';
import { FieldRenderProps } from 'react-final-form';
import { FetchError } from '@/typings/fetch';
import { SubmissionError } from '@shared/errors';

export type FileType = 'image';

type TypeProps = {
  fileType?: FileType;
  folder?: FileFolder;
};

type BaseData = TypeProps & {
  errors?: SubmissionError[];
  label?: React.ReactNode;
  value?: FileInfo;
};

export type FileInputButtonProps = BaseData & {
  loading: boolean;
  onChange: (file: File | null) => void; // Колбек для обработки выбранного файла
};

export type FileFieldProps = FieldRenderProps<FileInfo> & {
  label?: React.ReactNode;
  onChange?(file: File): void;
} & TypeProps;

export type FileButtonProps = BaseData & {
  onUpload(data: Maybe<FileInfo>): void;
  onError?(err: FetchError): void;
  onChange?(file: Maybe<File>): void;
};
