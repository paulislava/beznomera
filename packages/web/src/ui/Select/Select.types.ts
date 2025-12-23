import { SubmissionError } from '@shared/errors';
import { FieldRenderProps } from 'react-final-form';
import { Key } from 'react';
import { ValidatorsProps } from '../FormField/FormField.types';

export type RawSelectProps<
  OptionData extends Record<string, React.ReactNode> = Record<string, React.ReactNode>
> = {
  label: string;
  options: OptionData[];
  optionKey: keyof OptionData;
  optionValue: keyof OptionData;
  required?: boolean;
};

export type SelectProps<
  OptionData extends Record<string, React.ReactNode> = Record<string, React.ReactNode>
> = RawSelectProps<OptionData> & {
  name: string;
  errors: SubmissionError[];
  value: string;
  onChange(value: Maybe<Key>): void;
};

export type SelectFieldProps<
  FormData,
  OptionData extends Record<string, React.ReactNode>
> = ValidatorsProps &
  RawSelectProps<OptionData> & {
    name: Leaves<FormData>;
  };

export type FinalSelectProps<
  OptionData extends Record<string, React.ReactNode> = Record<string, React.ReactNode>
> = FieldRenderProps<any> & RawSelectProps<OptionData>;
