import { ResponseCode } from '@shared/errors';
import translates, { messages } from './ru';

export function getMessage(code: ResponseCode) {
  const result = messages[code];

  if (!result) {
    console.error(`Unknown response code: ${code}`);
    return `${messages[ResponseCode.Error]} (${code})`;
  }

  return result;
}
export const getErrorMessage = () => messages[ResponseCode.Error];

export type Translates = typeof translates;

export type TranslateKey = keyof Translates;

export function getTranslated<T extends TranslateKey>(group: T, key: keyof Translates[T]) {
  return translates[group][key];
}

export function getTranslateGroup<T extends TranslateKey>(group: T) {
  return translates[group];
}
