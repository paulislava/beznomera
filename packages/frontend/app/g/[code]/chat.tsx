import { Text, PageView } from '@/components/Themed';
import { carService } from '@/services';
import { CarInfo } from '@shared/car/car.types';
import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ImageSourcePropType, ImageStyle, StyleProp, View } from 'react-native';
import styled from 'styled-components/native';
import Recaptcha, { RecaptchaRef } from 'react-native-recaptcha-that-works';
import { handleEvent } from '@/utils/log';
import { isWeb } from '@/utils/env';
import { showResponseMessage } from '@/utils/messages';
import Button from '@/components/Button/Button';
import TextInput from '@/ui/TextInput/TextInput';
import {
  ModelRow,
  CarModelBrand,
  BrandLogo,
  CarModel,
  CarNumber,
  Nickname
} from '@/components/CarDetails';
import { PRODUCTION_URL } from '@/constants/site';
const InputContainer = styled(View)`
  margin: 20px 0;
  margin-left: -16px;
  width: 100%;
  max-width: 600px;
  height: 30vh;
`;

const consoleFunc = (...args: any) => console.log(args);

const brandLogoStyle: StyleProp<ImageStyle> = { resizeMode: 'contain' };

const ChatDriverPage = () => {
  const recaptcha = useRef<RecaptchaRef>(null);

  const { code } = useLocalSearchParams<{ code: string }>();
  const [requested, setRequested] = useState(false);
  const [info, setInfo] = useState<CarInfo | null>(null);
  const [called, setCalled] = useState(false);
  const [text, setText] = useState<string>();
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

  const sendHandler = useCallback(() => {
    if (!text) {
      alert('No text!');
      return;
    }

    const send = (location?: GeolocationPosition) => {
      setSubmitting(true);

      carService
        .sendMessage(
          {
            coords: location && {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            },
            text
          },

          code
        )
        .then(() => {
          handleEvent('send_message', { carId: info?.id, code });
          setCalled(true);
          setText('');
        })
        .catch(showResponseMessage)
        .finally(() => setSubmitting(false));
    };

    // recaptcha.current?.open();

    // return;

    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(send, () => send());
    } else {
      send();
    }
  }, [info, text]);

  const brandLogoSource: ImageSourcePropType = useMemo(
    () => ({ uri: info?.brand?.logoUrl ?? undefined }),
    [info]
  );

  const onChangeText = useCallback((content: string) => {
    setText(content);
    setCalled(false);
  }, []);

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
        <title>{info ? `${info.no}: чат с водителем` : 'Чат с водителем'}</title>
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
          <InputContainer>
            <TextInput value={text} onChangeText={onChangeText} multiline label='Сообщение' />
          </InputContainer>
          <Button onClick={sendHandler} disabled={submitting || called || !text}>
            {called ? 'Отправлено!' : submitting ? 'Отправка...' : 'Отправить'}
          </Button>
        </>
      )}
    </PageView>
  );
};

export default ChatDriverPage;
