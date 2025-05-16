import { Field } from 'react-final-form';
import { SelectFormFieldProps } from './Select.types';
import { useValidators } from '../../src/hooks/useValidators';
import { RawSelect } from './RawSelect';

export function SelectField<FormData, OptionValue = unknown>({
  name,
  validators: rawValidators,
  multiple,
  onChange,
  ...selectProps
}: SelectFormFieldProps<FormData, OptionValue>) {
  const validators = useValidators(rawValidators, { ...selectProps });

  if (multiple) {
    return (
      <Field<OptionValue[]>
        validate={validators}
        name={name}
        type='select'
        multiple
        render={props => (
          <RawSelect<OptionValue> multiple onChange={onChange} {...props} {...selectProps} />
        )}
      />
    );
  }

  return (
    <Field<OptionValue>
      validate={validators}
      name={name}
      type='select'
      render={props => <RawSelect<OptionValue> onChange={onChange} {...props} {...selectProps} />}
    />
  );
}
