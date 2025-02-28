import Button from '@/components/Button/Button';
import { CarImage } from '@/components/CarImage/CarImage';
import { StyledViewContainer, Text, TextL, PageView } from '@/components/Themed';
import { carService } from '@/services';
import { CarInfo } from '@shared/car/car.types';
import { Link, useGlobalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, ImageSourcePropType, ImageStyle, StyleProp, View } from 'react-native';
import styled from 'styled-components/native';
import Recaptcha, { RecaptchaRef } from 'react-native-recaptcha-that-works';
import { handleEvent } from '@/utils/log';
import { isWeb } from '@/utils/env';
import { showResponseMessage } from '@/utils/messages';

const CarModel = styled(TextL)`
  font-weight: 100;
  flex: 1;
`;

const CarModelBrand = styled(CarModel)`
  text-align: right;
`;

const CarNumber = styled(TextL)`
  font-weight: 200;
  margin-top: 20px;
`;

const ModelRow = styled(StyledViewContainer)`
  flex-flow: row;
  width: 100%;
`;

const BrandLogo = styled(Image)`
  margin: 0 10px;
  width: 100px;
  height: 21.5px;
`;

const StyledCarImage = styled(CarImage)`
  margin: 20px auto 40px;
  width: calc(100% - 40px);
  max-width: 400px;
  height: auto;
`;

const Nickname = styled(TextL)`
  margin-bottom: 20px;
`;

const ButtonsContainer = styled(View)`
  display: flex;
  flex-flow: column;
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
  const [submitting, setSubmitting] = useState(false);

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

  const callHandler = useCallback(() => {
    setSubmitting(true);

    const call = (location?: GeolocationPosition) =>
      carService
        .call(
          location
            ? {
                coords: { latitude: location.coords.latitude, longitude: location.coords.longitude }
              }
            : {},

          code
        )
        .then(() => {
          handleEvent('call', { carId: info?.id, code });
          setCalled(true);
        })
        .catch(showResponseMessage)
        .finally(() => setSubmitting(false));

    // recaptcha.current?.open();

    // return;

    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(call, () => call());
    } else {
      call();
    }
  }, [info]);

  const brandLogoSource: ImageSourcePropType = useMemo(
    () => ({ uri: info?.brand?.logoUrl ?? undefined }),
    [info]
  );

  return (
    <PageView fullHeight center>
      {!isWeb && (
        <Recaptcha
          ref={recaptcha}
          siteKey='6LfQpdkqAAAAAO3SXZIRkr4yso-Gm2DJFfetUjc0'
          baseUrl='https://beznomera.net'
          onVerify={consoleFunc}
          onExpire={consoleFunc}
          size='invisible'
        />
      )}
      <Head>
        <title>{info ? `${info.no}: информация об авто` : 'Информация об авто'}</title>
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
            <ModelRow $center>
              <CarModelBrand>{info.brandRaw || info.brand.title}</CarModelBrand>
              {info.brand.logoUrl && <BrandLogo style={brandLogoStyle} source={brandLogoSource} />}
              <CarModel>{info.model}</CarModel>
            </ModelRow>
          )}

          {info.no && <CarNumber>{info.no}</CarNumber>}

          {/* {info.no && <CarNumber>{info.no}</CarNumber>} */}
          <StyledCarImage color={info.color?.value ?? info.rawColor} />
          <ButtonsContainer>
            {info.owner.tel && (
              <Button externalHref={`tel:${info.owner.tel}`} view='glass'>
                Позвонить
              </Button>
            )}
            <Button onClick={callHandler} disabled={submitting || called}>
              {called
                ? 'Запрос отправлен!'
                : submitting
                ? 'Отправка запроса...'
                : 'Позвать водителя'}
            </Button>
            <Link href={`/g/${code}/chat`} asChild>
              <Button view='secondary'>Отправить сообщение</Button>
            </Link>
          </ButtonsContainer>
        </>
      )}
    </PageView>
  );
};

export default CallUserPage;
