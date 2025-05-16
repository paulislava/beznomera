import { PopupChildren, usePopup } from 'components/Popup';
import { FC, useCallback } from 'react';
import { S } from '..';

type AddOptionProps = {
    label?: React.ReactNode;
    popupContent: PopupChildren;
    onOpenPopup?(): void;
    onClosePopup?(): void;
};

export const AddOption: FC<AddOptionProps> = ({
    popupContent,
    label,
    onOpenPopup,
    onClosePopup
}) => {
    const openPopup = usePopup(popupContent, onClosePopup);

    const onClick = useCallback(() => {
        onOpenPopup?.();
        openPopup();
    }, [onOpenPopup, openPopup]);

    return (
        <S.AddOptionContainer>
            <S.AddOptionItem $active onClick={onClick}>
                {label || 'Добавить'}
            </S.AddOptionItem>
        </S.AddOptionContainer>
    );
};
