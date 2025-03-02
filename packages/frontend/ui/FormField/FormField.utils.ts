import { TypeValue } from './FormField.types';

const cleanPhoneNumber = (phone: string) => {
    return phone ? phone.replace(/[^\d+]/g, '') : '';
};

const cleanSnils = (snils: string) => {
    return snils ? snils.replace(/[^\d]/g, '') : '';
};

export const parseFunc = (type: TypeValue) => {
    switch (type) {
        case 'tel':
            return cleanPhoneNumber;
        case 'snils':
            return cleanSnils;
        default:
            return undefined;
    }
};
