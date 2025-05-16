import { HTMLInputTypeAttribute } from 'react';
import { SubmissionError } from '@shared/errors';
import { FieldInputProps, FieldRenderProps } from 'react-final-form';
export type RawInputType = HTMLInputTypeAttribute | 'textarea';

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
};

export type InputProps = MakeOptionalProps<FieldInputProps<any>, 'name' | 'onBlur' | 'onFocus'> &
  Partial<HTMLInputElement> &
  RawInputProps;

export type FinalInputProps = RawInputProps & FieldRenderProps<any>;
