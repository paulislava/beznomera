import { FC } from 'react';
import * as S from './Input.styled';
import { SubmissionError } from '@shared/errors';
import { FieldMetaState } from 'react-final-form';

type MetaProps = {
  meta?: FieldMetaState<unknown>;
  errors?: SubmissionError[];
};

export const InputMeta: FC<MetaProps> = ({ meta, errors }) => {
  if (!meta) {
    return null;
  }

  return (
    <S.MetaContainer>
      {meta.touched && !meta.dirtySinceLastSubmit && (
        <>
          {meta.error && <S.Meta>{meta.error}</S.Meta>}
          {(meta.submitError || errors)?.map(({ code, message }: SubmissionError) => (
            <S.Meta key={code}>{message}</S.Meta>
          ))}
        </>
      )}
    </S.MetaContainer>
  );
};
