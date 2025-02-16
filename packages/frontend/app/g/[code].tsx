import Button from '@/components/Button/Button';
import { CarImage } from '@/components/CarImage/CarImage';
import { StyledViewContainer, Text, View } from '@/components/Themed';
import { carService } from '@/services';
import { CarInfo } from '@shared/car/car.types';
import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import React, { useCallback, useEffect, useState } from 'react';
import { Image } from 'react-native';
import styled from 'styled-components/native';

const CarModel = styled(Text)`
  font-size: 18px;
  font-weight: 100;
`;

const CarNumber = styled(Text)`
  font-size: 18px;
`;

const InfoRow = styled(StyledViewContainer)`
  flex-flow: row;
`;

const BrandLogo = styled(Image)`
  height: 100%;
  margin: 0 10px;
`;

const StyledCarImage = styled(CarImage)`
  margin: 20px 0;
  z-index: 2;
  max-width: 400px;
  height: auto;
`;

const CallUserPage = () => {
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
    carService
      .call(code)
      .then(() => {
        setCalled(true);
      })
      .catch(error => {
        alert(error);
      });
  }, []);

  return (
    <View fullHeight center>
      <Head>
        <title>{info ? `${info.owner?.nickname}: информация об авто` : 'Информация об авто'}</title>
      </Head>
      {requested && !info && <Text>Ошибка: ссылка недействительна</Text>}
      <div>Code: {code}</div>
      {info && (
        <>
          <InfoRow $center>
            {(info.brand || info.brandRaw) && (
              <CarModel>
                {info.brand?.title || info.brandRaw}
                {info.model ? ` ${info.model}` : ''}
              </CarModel>
            )}
            {info.brand?.slug && (
              <BrandLogo
                style={{ resizeMode: 'contain' }}
                source={require(`@/assets/images/brands/audi.svg`)}
              />
            )}
            {info.no && <CarNumber>{info.no}</CarNumber>}
          </InfoRow>
          <StyledCarImage color={{ r: 0, g: 0, b: 10 }} />
          <Text>{JSON.stringify(info)}</Text>
          <Button onClick={callHandler}>{called ? 'Запрос отправлен!' : 'Позвать водителя'}</Button>
        </>
      )}
    </View>
  );
};

export default CallUserPage;
