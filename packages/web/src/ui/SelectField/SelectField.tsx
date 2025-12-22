import { Autocomplete, AutocompleteItem } from '@heroui/react';
import React from 'react';
import { Field } from 'react-final-form';

export type SelectFieldProps<
  FormData = any,
  OptionData extends Record<string, React.ReactNode> = Record<string, React.ReactNode>
> = {
  name: Leaves<FormData>;
  label: string;
  options: OptionData[];
  optionKey: keyof OptionData;
  optionValue: keyof OptionData;
  required?: boolean;
};

export function SelectField<
  FormData = any,
  OptionData extends Record<string, React.ReactNode> = Record<string, React.ReactNode>
>({
  name,
  label,
  options,
  optionKey,
  optionValue,
  required
}: SelectFieldProps<FormData, OptionData>) {
  return (
    <Field name={name}>
      {({ input, meta }) => (
        <Autocomplete
          name={input.name}
          label={label}
          isInvalid={!!meta.error}
          errorMessage={meta.error}
          onSelectionChange={input.onChange}
          selectedKey={input.value?.toString()}
          isRequired={required}
        >
          {options.map(option => (
            <AutocompleteItem key={option[optionKey] as string}>
              {option[optionValue]}
            </AutocompleteItem>
          ))}
        </Autocomplete>
      )}
    </Field>
  );
}
