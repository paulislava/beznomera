'use client';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react';
import { CarImage } from '../CarImage/CarImage';
import { TextL } from '../Themed';
import { CenterContainer } from '@/ui/Styled';
import {
  BrandLogo,
  CarExternalImage,
  CarModel,
  CarModelBrand,
  CarNumber,
  ModelRow
} from '../CarDetails';
import { FullCarInfo } from '@shared/car/car.types';
import { Button } from '@/ui/Button';
import { pluralize } from '@/utils/strings';
import { CarDrivers } from '../CarDrivers';
import { RequestUser } from '@shared/user/user.types';
import { CarRating } from '../CarRating';
import { carService } from '@/services';
import { revalidateCarPages } from '@/utils/paths';
import { showSuccessMessage, showErrorMessage } from '@/utils/messages';

const StyledCarImage = styled(CarImage)`
  margin: 40px 0;
  width: 100%;
  height: auto;
`;

const InfoContainer = styled.div`
  padding: 16px;
`;

const InfoText = styled(TextL)`
  font-size: 16px;
  margin-bottom: 8px;
`;

const StatsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
`;

const StatsItem = styled(TextL)`
  font-size: 14px;
  color: #666;
`;

const StyledModelRow = styled(ModelRow)`
  margin-top: 20px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-flow: column;
  align-items: center;
  gap: 16px;
`;

const QRButtonContainer = styled(CenterContainer)`
  margin: 20px 0;
`;

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const CarFullInfo = ({ info, user }: { info: FullCarInfo; user: RequestUser }) => {
  const isOwner = user?.userId === info.owner.id;
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleDeleteClick = () => {
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    try {
      await carService.delete(info.id);
      await revalidateCarPages(info.id, info.code);
      showSuccessMessage('Успех', 'Автомобиль успешно удален');
      onClose();
      router.push('/');
    } catch (error: any) {
      console.error('Failed to delete car:', error);
      showErrorMessage('Ошибка', 'Не удалось удалить автомобиль');
    }
  };

  return (
    <>
      {info.brand && (
        <StyledModelRow>
          <CarModelBrand>{info.brandRaw || info.brand.title}</CarModelBrand>
          {info.brand.logoUrl && <BrandLogo src={info.brand.logoUrl} alt={info.brand.title} />}
          <CarModel>{info.model}</CarModel>
        </StyledModelRow>
      )}

      {info.no && <CarNumber>{info.no}</CarNumber>}

      <CarRating
        carId={info.id}
        rating={info.rating ?? null}
        ratesCount={info.ratesCount ?? 0}
        ownerId={info.owner.id}
        driverIds={info.drivers?.map(d => d.id) ?? []}
      />

      {!!info.imageUrl || !!info.image?.url ? (
        <CarExternalImage
          width={400}
          height={info.imageRatio ? info.imageRatio * 400 : 142}
          alt={`${info.no}, ${info.brandRaw || info.brand?.title} ${info.model}`}
          $aspectRatio={info.imageRatio}
          src={(info.image?.url || info.imageUrl)!}
        />
      ) : (
        <StyledCarImage color={info.color?.value ?? info.rawColor} />
      )}

      <ActionsContainer>
        <StatsContainer>
          <StatsItem>Позвали: {pluralize(info.callsCount, ['раз', 'раза', 'раз'])}</StatsItem>
          <StatsItem>
            {pluralize(info.messagesCount, ['сообщение', 'сообщения', 'сообщений'])} в{' '}
            {pluralize(info.chatsCount, ['чате', 'чатах', 'чатах'])}
          </StatsItem>
        </StatsContainer>

        <QRButtonContainer>
          <Button href={`/car/${info.id}/qr`}>Получить QR-код</Button>
        </QRButtonContainer>

        <InfoContainer>
          {info.version && <InfoText>Версия: {info.version}</InfoText>}
          {info.year && <InfoText>Год выпуска: {info.year}</InfoText>}
          {info.color && <InfoText>Цвет: {info.color.title}</InfoText>}
        </InfoContainer>

        {/* Секция водителей */}
        {isOwner && <CarDrivers info={info} isOwner={isOwner} />}

        <ButtonsContainer>
          <Button href={`/car/${info.id}/edit`}>Редактировать</Button>
          <Button href={`/g/${info.code}`} view='glass'>
            Страница авто
          </Button>
          <Button view='danger' onClick={handleDeleteClick}>
            Удалить
          </Button>
        </ButtonsContainer>
      </ActionsContainer>

      <Modal isOpen={isOpen} onClose={onClose} placement='center'>
        <ModalContent>
          <ModalHeader>Подтвердите удаление</ModalHeader>
          <ModalBody>
            Вы уверены, что хотите удалить этот автомобиль? Это действие нельзя отменить.
          </ModalBody>
          <ModalFooter>
            <Button view='secondary' onClick={onClose}>
              Отмена
            </Button>
            <Button view='danger' onClick={handleDeleteConfirm}>
              Удалить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
