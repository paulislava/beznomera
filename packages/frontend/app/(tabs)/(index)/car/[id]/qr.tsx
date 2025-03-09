import React, { useCallback, useRef } from 'react';
import { useGlobalSearchParams, Stack } from 'expo-router';
import { View } from 'react-native';
import { PageView } from '@/components/Themed';
import styled from 'styled-components/native';
import { Button } from '@/ui/Button';
import { QRCode } from 'react-qrcode-logo';
import { PRODUCTION_URL } from '@/constants/site';
import { isWeb } from '@/utils/env';
import { cdnFileUrl } from '@/utils/files';
import { useColorScheme } from '@/components/useColorScheme';
import { useAPI } from '@/utils/api';
import { carService } from '@/services';
import useNeedAuth from '@/hooks/useNeedAuth';

const QRCodeContainer = styled(View)`
  margin: 20px 0;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  position: relative;
`;

const QRButtonsContainer = styled(View)`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
`;

export default function CarQRScreen() {
  useNeedAuth();

  const theme = useColorScheme();
  const qrRef = useRef<QRCode>(null);
  const { id } = useGlobalSearchParams<{ id: string }>();

  const getInfo = useCallback(() => carService.fullInfo(Number(id)), [id]);
  const info = useAPI(getInfo);

  const handleDownloadQR = useCallback(() => {
    if (qrRef.current && isWeb) {
      qrRef.current.download('png', `${info?.no}-qr.png`);
    }
  }, []);

  return (
    <PageView fullHeight>
      <Stack.Screen
        options={{
          title: info?.no ? `${info.no}: QR-код` : 'QR-код автомобиля'
        }}
      />

      <QRCodeContainer>
        {isWeb && info && (
          <QRCode
            value={`${PRODUCTION_URL}/g/${info.code}?from=qr`}
            size={200}
            qrStyle='fluid'
            ecLevel='H'
            eyeRadius={15}
            fgColor={theme === 'dark' ? '#fff' : '#090633'}
            bgColor='transparent'
            logoImage={`/logo-for-qr-${theme === 'dark' ? 'dark' : 'light'}.png`}
            logoWidth={100}
            logoHeight={100}
            removeQrCodeBehindLogo={true}
            logoPaddingStyle='square'
            ref={qrRef}
          />
        )}
        {isWeb && (
          <QRButtonsContainer>
            <Button onClick={handleDownloadQR}>Скачать QR-код</Button>
          </QRButtonsContainer>
        )}
      </QRCodeContainer>
    </PageView>
  );
}
