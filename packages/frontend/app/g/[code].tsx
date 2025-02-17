import Button from '@/components/Button/Button';
import { CarImage } from '@/components/CarImage/CarImage';
import { StyledViewContainer, Text, TextL, View } from '@/components/Themed';
import { carService } from '@/services';
import { CarInfo } from '@shared/car/car.types';
import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image } from 'react-native';
import styled from 'styled-components/native';
import Recaptcha, { RecaptchaRef } from 'react-native-recaptcha-that-works';

const CarModel = styled(TextL)`
  font-weight: 100;
  flex: 1;
  text-align: right;
`;

const CarNumber = styled(TextL)`
  flex: 1;
  font-weight: 100;
`;

const InfoRow = styled(StyledViewContainer)`
  flex-flow: row;
  width: 100%;
`;

const BrandLogo = styled(Image)`
  margin: 0 10px;
  width: 100px;
  height: 100%;
`;

const StyledCarImage = styled(CarImage)`
  margin: 40px auto;
  width: calc(100% - 40px);
  max-width: 400px;
  height: auto;
`;

const Nickname = styled(TextL)`
  margin-bottom: 20px;
`;

const consoleFunc = (...args: any) => console.log(args);

const CallUserPage = () => {
  const recaptcha = useRef<RecaptchaRef>(null);

  const { code } = useLocalSearchParams<{ code: string }>();
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

  const callHandler = useCallback(() => {
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
          setCalled(true);
        })
        .catch(error => {
          alert(error);
        });

    // recaptcha.current?.open();

    // return;

    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(call, () => call());
    } else {
      call();
    }
  }, []);

  return (
    <View fullHeight center>
      <Recaptcha
        ref={recaptcha}
        siteKey='6LfQpdkqAAAAAO3SXZIRkr4yso-Gm2DJFfetUjc0'
        baseUrl='https://beznomera.net'
        onVerify={consoleFunc}
        onExpire={consoleFunc}
        size='invisible'
      />
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

          <InfoRow $center>
            {(info.brand || info.brandRaw) && (
              <CarModel>
                {info.brand?.title || info.brandRaw}
                {info.model ? ` ${info.model}` : ''}
              </CarModel>
            )}
            {info.brand?.logoUrl && (
              <BrandLogo style={{ resizeMode: 'contain' }} source={{ uri: info.brand.logoUrl }} />
            )}
            {info.no && <CarNumber>{info.no}</CarNumber>}
          </InfoRow>
          <StyledCarImage color={info.color?.value ?? info.rawColor} />
          <Button onClick={callHandler} disabled={called}>
            {called ? 'Запрос отправлен!' : 'Позвать водителя'}
          </Button>
        </>
      )}
    </View>
  );
};

export default CallUserPage;
