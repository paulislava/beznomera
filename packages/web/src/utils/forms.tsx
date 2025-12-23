import { SubmissionError, ValidationCode } from '@shared/errors';
import { ResponseWithCode } from '@shared/responses';
import { SubmissionErrors, ValidationErrors } from 'final-form';
import { useMemo } from 'react';
import { FieldMetaState } from 'react-final-form';
import { showErrorMessage, showSuccessMessage } from './messages';

export const checkErrorAndScroll = (errors?: ValidationErrors | SubmissionErrors) => {
  if (errors && Object.keys(errors).length > 0) {
    const field = document.querySelector(`[name="${Object.keys(errors)[0]}"]`);

    if (field) {
      const label = field.closest('label');
      (label || field).scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
};

export const useErrorsContent = (errors?: SubmissionError[]) => {
  const errorsContent = useMemo(
    () =>
      errors?.length ? (
        <>
          {errors.map(er => (
            <div key={er.code}>{er.message}</div>
          ))}
        </>
      ) : undefined,
    [errors]
  );

  return errorsContent;
};

export const useMergeErrors = (meta: FieldMetaState<any>, errors?: SubmissionError[]) => {
  const finalErrors = useMemo(() => {
    if (!meta.touched || meta.dirtySinceLastSubmit) {
      return [];
    }

    const res: SubmissionError[] = errors || [];

    if (meta.error) {
      res.push({ message: meta.error, code: ValidationCode.UNKNOWN });
    }

    return res;
  }, [meta.touched, meta.dirtySinceLastSubmit, meta.error, errors]);

  return finalErrors;
};

export async function processFormSubmit<Result = any>(
  sendPromise: Promise<Result>,
  successMessage?: string,
  errorMessage?: string,
  callback?: (data: Result) => void,
  fallback?: (res: ResponseWithCode) => void
) {
  return sendPromise
    .then(data => {
      if (successMessage) {
        showSuccessMessage('Успех!', successMessage);
      }

      callback?.(data);
    })
    .catch((res: ResponseWithCode) => {
      if (errorMessage) {
        showErrorMessage('Ошибка!', errorMessage);
      }

      fallback?.(res);
      checkErrorAndScroll(res.errors);
      return res.errors;
    });
}
