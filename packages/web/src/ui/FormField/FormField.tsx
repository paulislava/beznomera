import { Field, useFormState } from 'react-final-form';

import { FinalTextInput } from '../TextInput';
import styled from 'styled-components';
import { FormFieldProps } from './FormField.types';
import { useValidators } from '@/hooks/useValidators';
// import { FileField } from '@/ui/FileButton/FileField';
import { useMemo } from 'react';
import { inputPlaceholders } from './constants';
import { normalizeFunc, parseFunc } from './FormField.utils';
import { View } from 'react-native';

// Контейнер для поля и кнопки
const Wrapper = styled.div`
  display: flex;
  flex-direction: row; /* Расположение элементов в строку */
  flex-wrap: nowrap; /* Элементы не переносятся */
  gap: 10px; /* Расстояние между элементами */
  align-content: stretch; /* По умолчанию */
  justify-content: center; /* Центровка по горизонтали */
  align-items: baseline; /* Выравнивание по базовой линии текста */
  width: 100%;
`;

/**
 * Компонент для создания полей в форме.
 * @template T Тип данных формы.
 * @param {FormFieldProps<T>} props - Пропсы поля.
 * @returns {JSX.Element} - Отображение поля в форме.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FormField<T = any>({
  required,
  validators: rawValidators,
  component,
  type,
  placeholder,
  ...props
}: FormFieldProps<T>) {
  const additionalValidators: ((value: unknown) => string | undefined)[] = [];

  const validators = useValidators([...(rawValidators || []), ...additionalValidators], {
    required
  });

  const finalComponent = FinalTextInput;
  let finalMask: string | undefined;

  // if (type === 'file') {
  //   finalComponent = FileField;
  // }

  let finalType = type;

  if (type === 'inn') {
    finalType = 'number';
    finalMask = '000000000000';
  }

  if (type === 'tel') {
    finalMask = '+7 (000) 000-00-00';
  }

  if (type === 'snils') {
    finalMask = '000-000-000 00';
  }

  const finalPlaceholder = useMemo(
    () => placeholder || (type && inputPlaceholders[type]),
    [placeholder, type]
  );

  const { submitErrors } = useFormState();

  const errors = useMemo(
    () => (props.name ? submitErrors?.[props.name] : undefined),
    [submitErrors, props]
  );

  const parse = useMemo(() => (type ? parseFunc(type) : undefined), [type]);

  /**
   * Отображение поля в форме.
   * @returns {JSX.Element}
   */
  return (
    <Wrapper>
      <Field
        required={required}
        validate={validators}
        component={component || finalComponent}
        type={finalType || 'text'}
        parse={parse}
        errors={errors}
        placeholder={finalPlaceholder}
        {...props}
        mask={finalMask}
      />
    </Wrapper>
  );
}

export default FormField;
