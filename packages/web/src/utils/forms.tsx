import { SubmissionError, ValidationCode } from '@shared/errors';
import { SubmissionErrors, ValidationErrors } from 'final-form';
import { useMemo } from 'react';
import { FieldMetaState } from 'react-final-form';

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

    if (meta.submitError) {
      res.push(...meta.submitError);
    }

    if (meta.error) {
      res.push({ message: meta.error, code: ValidationCode.UNKNOWN });
    }

    return res;
  }, [meta.touched, meta.dirtySinceLastSubmit, meta.submitError, meta.error, errors]);

  return finalErrors;
};
