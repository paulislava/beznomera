import { SubmissionErrors, ValidationErrors } from 'final-form';

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
