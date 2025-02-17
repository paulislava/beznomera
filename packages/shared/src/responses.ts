import { ResponseCode } from './errors';

export interface ResponseWithCode {
  code: ResponseCode;
  message?: string;
}
