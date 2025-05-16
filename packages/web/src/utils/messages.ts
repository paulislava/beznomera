import { getMessage } from '@/locale';
import { ResponseWithCode } from '@shared/responses';

export const showResponseMessage = (response: ResponseWithCode) => {
  alert(getMessage(response.code));
};
