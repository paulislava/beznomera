import { Autocomplete, AutocompleteItem } from '@heroui/react';
import React, { FC } from 'react';
import { Field } from 'react-final-form';

{
  /* <FinalField name='brand'>
{({ input, meta }) => (
  <Autocomplete
    name={input.name}
    label={'Марка'}
    isInvalid={!!meta.error}
    errorMessage={meta.error}
    onSelectionChange={input.onChange}
  >
    {brands.map(brand => (
      <AutocompleteItem key={brand.id}>{brand.title}</AutocompleteItem>
    ))}
  </Autocomplete>
)}
</FinalField> */
}

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
