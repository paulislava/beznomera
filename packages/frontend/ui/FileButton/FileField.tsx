import { FC } from 'react';
import { FileButton } from './FileButton';
import * as S from 'ui/Input/Input.styled';
import { FileFieldProps } from './FileButton.types';

export const FileField: FC<FileFieldProps> = ({
    input,
    label,
    fileType,
    onChange
}) => {
    const content = (
        <FileButton
            onUpload={input.onChange}
            onChange={onChange}
            value={input.value}
            fileType={fileType}
        />
    );

    if (!label) {
        return content;
    }

    return (
        <S.Container>
            <S.Label>{label}</S.Label>
            {content}
            <S.MetaContainer></S.MetaContainer>
        </S.Container>
    );
};
