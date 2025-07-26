import { ResponseCode } from '@shared/errors';

export const messages: Partial<Record<ResponseCode, string>> = {
  [ResponseCode.Error]: 'Произошла неизвестная ошибка. Повторите попытку позже.',
  [ResponseCode.CALL_NEED_TIMEOUT]: 'Превышено количество вызовов. Повторите попытку позже.',
  [ResponseCode.USER_OR_DRAFT_NOT_FOUND]: 'Пользователь или черновик не найден.',
  [ResponseCode.WRONG_AUTH_CODE]: 'Неверный код авторизации.',
  [ResponseCode.NOT_FOUND]: 'Запрашиваемый ресурс не найден.',
  [ResponseCode.WRONG_MIMETYPE]: 'Неверный тип файла.'
};

const locale = {
  messages
};

export default locale;
