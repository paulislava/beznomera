import { FC } from 'react';
import * as S from './Input.styled';

type InputInformationProps = {
  label: string; // Название метки
  value?: string; // Значение инпута
};

const InputInformation: FC<InputInformationProps> = ({ label, value = '' }) => {
  return (
    <S.Container>
      <S.Label>{label}</S.Label>
      <S.InputRow>
        <S.InputContainer>
          <S.Input readOnly value={value} />
        </S.InputContainer>
      </S.InputRow>
    </S.Container>
  );
};

export default InputInformation;
