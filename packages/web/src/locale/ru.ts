import { ResponseCode } from '@shared/errors';

export const messages: Partial<Record<ResponseCode, string>> = {
  [ResponseCode.Error]: 'Произошла неизвестная ошибка. Повторите попытку позже.',
  [ResponseCode.CALL_NEED_TIMEOUT]: 'Превышено количество вызовов. Повторите попытку позже.'
};

const locale = {
  messages
};

export default locale;
