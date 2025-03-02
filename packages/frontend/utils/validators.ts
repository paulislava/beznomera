/* eslint-disable @typescript-eslint/no-explicit-any */
export const required = (value: unknown) =>
  (Array.isArray(value) && value.length > 0) || (!Array.isArray(value) && value)
    ? undefined
    : 'Обязательное поле';
export const mustBeNumber = (value: number) => (isNaN(value) ? 'Must be a number' : undefined);
export const minValue = (min: number) => (value: number) =>
  isNaN(value) || value >= min ? undefined : `Should be greater than ${min}`;

export const composeValidators =
  (...validators: any[]) =>
  (value: unknown) =>
    validators.reduce((error, validator) => error || validator(value), undefined);
