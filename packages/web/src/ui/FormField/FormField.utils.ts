import { TypeValue } from './FormField.types';

const cleanPhoneNumber = (phone: string) => {
  return phone ? phone.replace(/[^\d+]/g, '') : '';
};

const cleanSnils = (snils: string) => {
  return snils ? snils.replace(/[^\d]/g, '') : '';
};

const cleanNumber = (number: string) => {
  const value = number ? number.replace(/[^\d.]/g, '') : '';
  return value ? parseFloat(value) : undefined;
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
