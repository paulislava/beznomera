import { SubmissionError } from '@shared/errors';
import { FieldInputProps, FieldRenderProps } from 'react-final-form';
export type RawInputType = 'text' | 'search' | 'url' | 'tel' | 'email' | 'password' | (string & {});

export type RawInputProps = {
  label?: React.ReactNode;
  rightContent?: React.ReactNode;
  mask?: string;
  center?: boolean;
  type?: RawInputType;
  errors?: SubmissionError[];
  maxRows?: number;
  hideMeta?: boolean;
  onClick?(): void;
  onlyInput?: boolean;
  height?: number;
  value?: string;
};

export type InputProps = MakeOptionalProps<FieldInputProps<any>, 'name' | 'onBlur' | 'onFocus'> &
  Partial<HTMLInputElement> &
  RawInputProps;

export type FinalInputProps = RawInputProps & FieldRenderProps<any>;
