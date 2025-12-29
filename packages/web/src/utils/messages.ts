import { getMessage } from '@/locale';
import { ResponseWithCode } from '@shared/responses';
import { addToast } from '@heroui/react';

export const showResponseMessage = (response: ResponseWithCode) => {
  const message = getMessage(response.code);

  addToast({
    title: 'Уведомление',
    description: message,
    color: 'warning',
    variant: 'flat',
    timeout: 5000
  });
};

export const showSuccessMessage = (title: string, description: string) => {
  addToast({
    title,
    description,
    color: 'success',
    variant: 'flat',
    timeout: 3000
  });
};

export const showErrorMessage = (title: string, description: string) => {
  addToast({
    title,
    description,
    color: 'danger',
    variant: 'flat',
    timeout: 500000
  });
};
