'use client';

import Button from '@/ui/Button/Button';
import { carService } from '@/services';
import { CarInfo } from '@shared/car/car.types';

import React, { useCallback, useMemo, useState } from 'react';

import { handleEvent } from '@/utils/log';
import { TELEGRAM_BOT_NAME } from '@/utils/env';
import { showResponseMessage } from '@/utils/messages';
import {
  Nickname,
  ModelRow,
  CarModelBrand,
  BrandLogo,
  CarModel,
  CarNumber,
  StyledCarImage,
  CarExternalImage
} from '@/components/CarDetails';
import { ButtonsColumn } from '@/ui/Styled';
import Link from 'next/link';
import { isTelegramWebApp } from '@/utils/telegram';
import { AddOwnerButton } from '@/components/AddOwnerButton';

interface CarInfoProps {
  info: CarInfo;
  code: string;
}

export const CarInfoPage = ({ info, code }: CarInfoProps) => {
  const [called, setCalled] = useState(false);
  const eventData = useMemo(() => ({ carId: info?.id, code }), [info, code]);

  const callHandler = useCallback(
    () =>
      new Promise<void>((resolve, reject) => {
        const call = (location?: GeolocationPosition) =>
          carService
            .call(
              location
                ? {
                    coords: {
                      latitude: location.coords.latitude,
                      longitude: location.coords.longitude
                    }
                  }
                : {},

              code
            )
            .then(() => {
              handleEvent('call_success', eventData);
              setCalled(true);
              resolve();
            })
            .catch(res => {
              reject(res);
              showResponseMessage(res);
              handleEvent('call_error', { ...eventData, res });
            });

        if (navigator?.geolocation) {
          navigator.geolocation.getCurrentPosition(call, () => call());
        } else {
          call();
        }
      }),
    [code, eventData]
  );

  const openChat = useCallback(() => {
    window.open(`tg://resolve?domain=${TELEGRAM_BOT_NAME}&start=msg_${encodeURIComponent(code)}`);
  }, [code]);

  return (
    <>
      {!!(info.owner.nickname || info.owner.firstName || info.owner.lastName) && (
        <Nickname>
          {info.owner.nickname ?? `${info.owner.firstName} ${info.owner.lastName}`}
        </Nickname>
      )}

      {info.brand && (
        <ModelRow>
          <CarModelBrand>{info.brandRaw || info.brand.title}</CarModelBrand>
          {info.brand.logoUrl && (
            <BrandLogo alt={info.brand.title} src={info.brand.logoUrl} height={21.5} width={100} />
          )}
          <CarModel>{info.model}</CarModel>
        </ModelRow>
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
      <ButtonsColumn>
        {info.owner.tel && (
          <Button
            fullWidth
            href={`tel:${info.owner.tel}`}
            view='glass'
            event='tel_call'
            eventParams={eventData}
            noFollowNoIndex
          >
            Позвонить
          </Button>
        )}
        <Button
          fullWidth
          onClick={callHandler}
          disabled={called}
          event='call'
          eventParams={eventData}
        >
          {called ? 'Запрос отправлен!' : 'Позвать водителя'}
        </Button>
        <Link href={`/g/${code}/chat`}>
          <Button
            fullWidth
            view='secondary'
            onClick={openChat}
            event='go_chat'
            eventParams={eventData}
          >
            Отправить сообщение
          </Button>
        </Link>
        {isTelegramWebApp && <AddOwnerButton carId={info.id} eventData={eventData} />}
        <Button href='/' view='glass' event='go_create_qr' eventParams={eventData}>
          Создать свой QR-код
        </Button>
      </ButtonsColumn>
    </>
  );
};
