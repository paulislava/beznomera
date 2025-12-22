import { FC } from 'react';
import * as S from './Input.styled';
import { SubmissionError } from '@shared/errors';
import { FieldMetaState } from 'react-final-form';

type MetaProps = {
  meta?: FieldMetaState<unknown>;
  errors?: SubmissionError[];
};

export const InputMeta: FC<MetaProps> = ({ meta, errors }) => {
  if (!meta || (!meta.error && !meta.submitError?.length && !errors?.length)) {
    return null;
  }

  // if (!meta.touched || meta.dirtySinceLastSubmit) {
  //   return null;
  // }

  return (
    <S.MetaContainer>
      {meta.error && <S.Meta>{meta.error}</S.Meta>}
      {(meta.submitError || errors)?.map(({ code, message }: SubmissionError) => (
        <S.Meta key={code}>{message}</S.Meta>
      ))}
    </S.MetaContainer>
  );
};
