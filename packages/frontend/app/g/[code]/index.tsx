import Button from '@/ui/Button/Button';
import { Text, PageView } from '@/components/Themed';
import { carService } from '@/services';
import { CarInfo } from '@shared/car/car.types';
import { Link, useGlobalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ImageSourcePropType, ImageStyle, StyleProp, View } from 'react-native';
import styled from 'styled-components/native';
import Recaptcha, { RecaptchaRef } from 'react-native-recaptcha-that-works';
import { handleEvent } from '@/utils/log';
import { isWeb, TELEGRAM_BOT_NAME } from '@/utils/env';
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
import { PRODUCTION_URL } from '@/constants/site';
import { openLink } from '@/utils/link';

const ButtonsContainer = styled(View)`
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;

const consoleFunc = (...args: any) => console.log(args);

const brandLogoStyle: StyleProp<ImageStyle> = { resizeMode: 'contain' };

const CallUserPage = () => {
  const recaptcha = useRef<RecaptchaRef>(null);

  const { code } = useGlobalSearchParams<{ code: string }>();
  const [requested, setRequested] = useState(false);
  const [info, setInfo] = useState<CarInfo | null>(null);
  const [called, setCalled] = useState(false);

  // useSetTitle(info ? `${info.owner?.nickname}: информация об авто` : 'Информация об авто');

  useEffect(() => {
    carService
      .info(code)
      .then(info => {
        setRequested(true);
        setInfo(info);
      })
      .catch(() => {
        setRequested(true);
      });
  }, [code]);

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
                      lat: location.coords.latitude,
                      lng: location.coords.longitude
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

        // recaptcha.current?.open();

        // return;

        if (navigator?.geolocation) {
          navigator.geolocation.getCurrentPosition(call, () => call());
        } else {
          call();
        }
      }),
    [info, eventData]
  );

  const brandLogoSource: ImageSourcePropType = useMemo(
    () => ({ uri: info?.brand?.logoUrl ?? undefined }),
    [info]
  );

  const [title, description] = useMemo(
    () =>
      info
        ? [
            `${info.no}: связаться с владельцем автомобиля`,
            `Связаться с владельцем автомобиля ${info.no}, ${info.brandRaw || info.brand?.title} ${
              info.model || ''
            }. Уведомление в Telegram, сообщение или звонок.`
          ]
        : [
            'Связаться с владельцем автомобиля',
            'Связзаться с владельцем автомобиля. Уведомление в Telegram, сообщение или звонок.'
          ],
    [info]
  );

  const openChat = useCallback(() => {
    openLink(`tg://resolve?domain=${TELEGRAM_BOT_NAME}&start=message:${encodeURIComponent(code)}`);
  }, [code]);

  return (
    <PageView fullHeight center>
      {!isWeb && (
        <Recaptcha
          ref={recaptcha}
          siteKey='6LfQpdkqAAAAAO3SXZIRkr4yso-Gm2DJFfetUjc0'
          baseUrl={PRODUCTION_URL}
          onVerify={consoleFunc}
          onExpire={consoleFunc}
          size='invisible'
        />
      )}
      <Head>
        <title>{title}</title>
        <meta name='description' content={description} />
        <meta property='og:title' content={title} />
        <meta property='og:description' content={description} />
        {info?.imageUrl && <meta property='og:image' content={info.imageUrl} />}
        <meta property='og:type' content='website' />
        <meta name='robots' content='index, follow' />
        <link rel='canonical' href={`${PRODUCTION_URL}/g/${code}`} />
      </Head>
      {requested && !info && <Text>Ошибка: ссылка недействительна</Text>}

      {info && (
        <>
          {!!(info.owner.nickname || info.owner.firstName || info.owner.lastName) && (
            <Nickname>
              {info.owner.nickname ?? `${info.owner.firstName} ${info.owner.lastName}`}
            </Nickname>
          )}

          {info.brand && (
            <ModelRow>
              <CarModelBrand>{info.brandRaw || info.brand.title}</CarModelBrand>
              {info.brand.logoUrl && <BrandLogo style={brandLogoStyle} source={brandLogoSource} />}
              <CarModel>{info.model}</CarModel>
            </ModelRow>
          )}

          {info.no && <CarNumber>{info.no}</CarNumber>}

          {/* {info.no && <CarNumber>{info.no}</CarNumber>} */}
          {info.imageUrl ? (
            <CarExternalImage
              alt={`${info.no}, ${info.brandRaw || info.brand?.title} ${info.model}`}
              $aspectRatio={info.imageRatio}
              source={{ uri: info.imageUrl }}
            />
          ) : (
            <StyledCarImage color={info.color?.value ?? info.rawColor} />
          )}
          <ButtonsContainer>
            {info.owner.tel && (
              <Button
                fullWidth
                externalHref={`tel:${info.owner.tel}`}
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
            <Link href={`/g/${code}/chat`} asChild>
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
          </ButtonsContainer>
        </>
      )}
    </PageView>
  );
};

export default CallUserPage;
