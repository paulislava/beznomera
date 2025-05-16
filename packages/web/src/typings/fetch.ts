import { ResponseCode, SubmissionError } from '@shared/errors';

export type FetchResult<T = undefined> = {
  data: T;
  ok: boolean;
  code: (typeof ResponseCode)[keyof typeof ResponseCode];
  msg?: string;
};

export type FormErrors<RequestModel> = Record<keyof RequestModel, SubmissionError[]>;

export type FetchError<RequestModel = any> = Omit<FetchResult<string>, 'data'> & {
  ok: false;
  fields?: FormErrors<RequestModel>;
};
