import { TypeValue } from './FormField.types';

const cleanPhoneNumber = (phone: string) => {
  return phone ? phone.replace(/[^\d+]/g, '') : '';
};

const cleanSnils = (snils: string) => {
  return snils ? snils.replace(/[^\d]/g, '') : '';
};

const cleanNumber = (number: string) => {
  return number ? number.replace(/[^\d]/g, '') : '';
};

export const parseFunc = (type: TypeValue) => {
  switch (type) {
    case 'number':
      return cleanNumber;
    case 'tel':
      return cleanPhoneNumber;
    case 'snils':
      return cleanSnils;
    default:
      return undefined;
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const normalizeFunc = (_: TypeValue) => undefined;
