export enum ResponseCode {
  Error = 'error',
  CALL_NEED_TIMEOUT = 'call-need-timeout',
  USER_OR_DRAFT_NOT_FOUND = 'user-or-draft-not-found',
  WRONG_AUTH_CODE = 'wrong-auth-code',
  NOT_FOUND = 'not-found'
}

export type SubmissionError = {
  code: string;
  message: string;
  props: Record<string, any>;
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
