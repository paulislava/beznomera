import { HTMLInputTypeAttribute } from 'react';
import { SubmissionError } from '@paulislava/shared/errors';
import { TextInputLabelProp } from 'react-native-paper/lib/typescript/components/TextInput/types';
import { FieldRenderProps } from 'react-final-form';

export type RawInputType = HTMLInputTypeAttribute | 'textarea';

export type RawInputProps = {
  label?: TextInputLabelProp;
  rightContent?: React.ReactNode;
  mask?: string;
  center?: boolean;
  type?: RawInputType;
  errors?: SubmissionError[];
  maxRows?: number;
};

export type TextInputProps = RawInputProps & {
  touched?: boolean;
  errorText?: string;
  onChange?: (value: string) => void;
  value?: Maybe<string>;
  multiline?: boolean;
};

export type FinalTextInputProps = RawInputProps & FieldRenderProps<string>;
