import { FieldValidator } from 'final-form';
import { useMemo } from 'react';
import { ValidatorsProps } from '../ui/FormField/FormField.types';
import * as V from '@/utils/validators';

type ValidationOptions = {
  required?: boolean;
};

export const useValidators = (
  rawValidators: ValidatorsProps['validators'],
  { required }: ValidationOptions
) => {
  /**
   * Массив валидаторов для поля.
   * @type {FieldValidator<unknown>[]}
   */
  const validators = useMemo(() => {
    const res: FieldValidator<unknown>[] = [];

    if (required) {
      /**
       * Добавляем валидатор для обязательных полей.
       */
      res.push(V.required);
    }

    if (rawValidators) {
      /**
       * Добавляем пользовательские валидаторы.
       */
      res.push(...rawValidators);
    }

    /**
     * Возвращаем массив валидаторов.
     * @returns {FieldValidator<unknown>[]}
     */
    return V.composeValidators(...res);
  }, [required, rawValidators]);

  return validators;
};
