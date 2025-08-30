'use client';
import styled from 'styled-components';
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
import { isTelegramWebApp } from '@/utils/telegram';
import Link from 'next/link';
import { AddOwnerButton } from '../AddOwnerButton';
import { CarDrivers } from '../CarDrivers';
import { RequestUser } from '@shared/user/user.types';

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
  flex-direction: row;
  justify-content: space-between;
  flex-flow: column;
  align-items: center;
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

      {info.imageUrl ? (
        <CarExternalImage
          width={400}
          height={info.imageRatio ? info.imageRatio * 400 : 142}
          alt={`${info.no}, ${info.brandRaw || info.brand?.title} ${info.model}`}
          $aspectRatio={info.imageRatio}
          src={info.imageUrl}
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
          <Link href={`/car/${info.id}/qr`}>
            <Button>Получить QR-код</Button>
          </Link>
        </QRButtonContainer>

        <InfoContainer>
          {info.version && <InfoText>Версия: {info.version}</InfoText>}
          {info.year && <InfoText>Год выпуска: {info.year}</InfoText>}
          {info.color && <InfoText>Цвет: {info.color.title}</InfoText>}
        </InfoContainer>

        {/* Секция водителей */}
        {isOwner && <CarDrivers info={info} isOwner={isOwner} />}

        <ButtonsContainer>
          <Link href={`/car/${info.id}/edit`}>
            <Button>Редактировать</Button>
          </Link>
          {isTelegramWebApp && <AddOwnerButton carId={info.id} eventData={{ code: info.code }} />}
        </ButtonsContainer>
        <CenterContainer>
          <Button view='danger' onClick={() => {}}>
            Удалить
          </Button>
        </CenterContainer>
      </ActionsContainer>
    </>
  );
};
