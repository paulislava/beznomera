import { ResponseCode, SubmissionError } from './errors';

export interface ResponseWithCode {
  code: ResponseCode;
  errors?: Record<string, SubmissionError[]>;
  message?: string;
}
