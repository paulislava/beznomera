import { FileInfo } from '@shared/file/file.types';
import { FieldRenderProps } from 'react-final-form';
import { FetchError } from '@/typings/fetch';

export type FileType = 'image';

type TypeProps = {
  fileType?: FileType;
};

type BaseData = TypeProps & {
  value?: FileInfo;
};

export type FileInputButtonProps = BaseData & {
  onChange: (file: File | null) => void; // Колбек для обработки выбранного файла
};

export type FileFieldProps = FieldRenderProps<FileInfo> & {
  label?: React.ReactNode;
  onChange?(file: File): void;
} & TypeProps;

export type FileButtonProps = BaseData & {
  onUpload(data: FileInfo): void;
  onError?(err: FetchError): void;
  onChange?(file: File): void;
};
