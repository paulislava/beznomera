import { StyledViewContainer, Text, TextL, PageView } from '@/components/Themed';
import { carService } from '@/services';
import { CarInfo } from '@shared/car/car.types';
import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, ImageSourcePropType, ImageStyle, StyleProp, View } from 'react-native';
import styled from 'styled-components/native';
import Recaptcha, { RecaptchaRef } from 'react-native-recaptcha-that-works';
import { handleEvent } from '@/utils/log';
import { isWeb } from '@/utils/env';
import { showResponseMessage } from '@/utils/messages';
import Button from '@/components/Button/Button';
import { TextInput } from 'react-native-paper';

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

const Nickname = styled(TextL)`
  margin-bottom: 20px;
`;

const InputContainer = styled(View)`
  margin: 20px 0;
  margin-right: -16px;
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
          baseUrl='https://beznomera.net'
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

          <InfoRow $center>
            {(info.brand || info.brandRaw) && (
              <CarModel>
                {info.brand?.title || info.brandRaw}
                {info.model && ` ${info.model}`}
              </CarModel>
            )}
            {info.brand?.logoUrl && <BrandLogo style={brandLogoStyle} source={brandLogoSource} />}
            {info.no && <CarNumber>{info.no}</CarNumber>}
          </InfoRow>
          <InputContainer>
            <TextInput
              mode='flat'
              value={text}
              outlineColor='white'
              onChangeText={onChangeText}
              multiline
              label='Сообщение'
              textColor='#fff'
              activeUnderlineColor='#dbb3b3'
              style={{ backgroundColor: 'transparent', minHeight: '100%' }}
              underlineStyle={{ marginLeft: 16 }}
              contentStyle={{ paddingTop: 0, marginTop: 26 }}
            />
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
