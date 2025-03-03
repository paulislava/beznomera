export enum ResponseCode {
  Error = 'error',
  CALL_NEED_TIMEOUT = 'call-need-timeout',
  USER_OR_DRAFT_NOT_FOUND = 'user-or-draft-not-found',
  WRONG_AUTH_CODE = 'wrong-auth-code',
  NOT_FOUND = 'not-found'
}

export enum ValidationCode {
  DUPLICATE_NUMBER = 'DUPLICATE_NUMBER',
  DUPLICATE_CODE = 'DUPLICATE_CODE'
}

export type SubmissionError = {
  message: string;
  code: ValidationCode;
  props?: Record<string, any>;
};

export type FetchResult<T = undefined> = {
  data: T;
  ok: boolean;
  code: typeof ResponseCode[keyof typeof ResponseCode];
  msg?: string;
};

export type FormErrors<RequestModel> = Record<keyof RequestModel, SubmissionError[]>;

export type FetchError<RequestModel = any> = Omit<FetchResult<string>, 'data'> & {
  ok: false;
  fields?: FormErrors<RequestModel>;
};
