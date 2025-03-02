import { FileData } from 'api/file/file.types';
import { FieldRenderProps } from 'react-final-form';
import { FetchError } from 'typings/fetch';

export type FileType = 'image';

type TypeProps = {
    fileType?: FileType;
};

type BaseData = TypeProps & {
    value?: FileData;
};

export type FileInputButtonProps = BaseData & {
    onChange: (file: File | null) => void; // Колбек для обработки выбранного файла
};

export type FileFieldProps = FieldRenderProps<FileData> & {
    label?: React.ReactNode;
    onChange?(file: File): void;
} & TypeProps;

export type FileButtonProps = BaseData & {
    onUpload(data: FileData): void;
    onError?(err: FetchError): void;
    onChange?(file: File): void;
};
