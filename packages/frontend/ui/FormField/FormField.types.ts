import { FieldRenderProps } from 'react-final-form';
import { FileFieldProps, FileType } from '@/ui/FileButton/FileButton.types';
import { TextInputProps, RawInputType } from '@/ui/TextInput/TextInput.types';

export type ValidatorsProps = {
  validators?: ((value: unknown) => string | undefined)[];
};

export type TypeValue = RawInputType;

type RawFormFieldProps<T> = Omit<Partial<HTMLInputElement>, 'children' | 'type'> &
  Omit<FieldRenderProps<unknown, HTMLElement, unknown>, 'type'> &
  ValidatorsProps & {
    name: Paths<T>;

    type?: TypeValue;
    // Используй validators
    validate?: undefined;

    fileType?: FileType;
  } & Pick<TextInputProps, 'center' | 'label' | 'rightContent'>;

export type FormFieldProps<T> = RawFormFieldProps<T> &
  (
    | ({ type: 'file' } & Pick<FileFieldProps, 'onChange' | 'fileType'>)
    | ({ type: 'textarea' } & Pick<TextInputProps, 'maxRows'>)
    | { fileType?: undefined; maxRows?: undefined; onChange?: undefined }
  );
