import { useErrorsContent } from '@/utils/forms';
import { Autocomplete, AutocompleteItem } from '@heroui/react';
import { SelectProps } from './Select.types';

export function Select<
  OptionData extends Record<string, React.ReactNode> = Record<string, React.ReactNode>
>({
  name,
  label,
  options,
  optionKey,
  optionValue,
  required,
  errors,
  value,
  onChange
}: SelectProps<OptionData>) {
  const errorsContent = useErrorsContent(errors);

  return (
    <Autocomplete
      name={name}
      label={label}
      isInvalid={!!errorsContent}
      errorMessage={errorsContent}
      onSelectionChange={onChange}
      selectedKey={value}
      isRequired={required}
    >
      {options.map(option => (
        <AutocompleteItem key={option[optionKey] as string}>{option[optionValue]}</AutocompleteItem>
      ))}
    </Autocomplete>
  );
}
