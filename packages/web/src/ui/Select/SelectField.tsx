import React from 'react';
import { Field, useFormState } from 'react-final-form';
import { useValidators } from '@/hooks/useValidators';
import { useMergeErrors } from '@/utils/forms';
import { Select } from './Select';
import { FinalSelectProps, SelectFieldProps } from './Select.types';

export function FinalSelect<
  OptionData extends Record<string, React.ReactNode> = Record<string, React.ReactNode>
>({ meta, errors, input, ...props }: FinalSelectProps<OptionData>) {
  const finalErrors = useMergeErrors(meta, errors);

  return (
    <Select
      name={input.name}
      value={input.value?.toString()}
      onChange={input.onChange}
      {...props}
      errors={finalErrors}
    />
  );
}

export function SelectField<
  FormData = any,
  OptionData extends Record<string, React.ReactNode> = Record<string, React.ReactNode>
>({ name, validators: rawValidators, ...selectProps }: SelectFieldProps<FormData, OptionData>) {
  const validators = useValidators(rawValidators, { ...selectProps });
  const { submitErrors } = useFormState();

  return (
    <Field validate={validators} name={name} type='select'>
      {({ input, meta }) => (
        <FinalSelect input={input} meta={meta} errors={submitErrors?.[name]} {...selectProps} />
      )}
    </Field>
  );
}
