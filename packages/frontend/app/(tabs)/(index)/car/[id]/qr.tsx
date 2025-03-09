import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useGlobalSearchParams, Stack } from 'expo-router';
import { View } from 'react-native';
import { PageView } from '@/components/Themed';
import styled from 'styled-components/native';
import { Button } from '@/ui/Button';
import { QRCode } from 'react-qrcode-logo';
import { PRODUCTION_URL } from '@/constants/site';
import { isWeb } from '@/utils/env';
import { useColorScheme } from '@/components/useColorScheme';
import { useAPI } from '@/utils/api';
import { carService } from '@/services';
import useNeedAuth from '@/hooks/useNeedAuth';
import { QRTemplate } from '@/components/QRTemplate';
import Svg from 'react-native-svg';
import { Canvg } from 'canvg';
import webStyled from 'styled-components';
import { Loading } from '@/components/Loading';
import { CenterContainer } from '@/ui/Styled';
import { downloadFile } from '@/utils/downloadFile';
import { downloadFile as downloadFileTelegram } from '@telegram-apps/sdk-react';

const QRCodeContainer = styled(View)`
  margin: 20px 0;
  align-items: center;
`;

const StyledCanvas = webStyled.canvas`
  margin-bottom: 20px;
`;

export default function CarQRScreen() {
  useNeedAuth();

  const theme = useColorScheme();
  const { id } = useGlobalSearchParams<{ id: string }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const templateRef = useRef<Svg>(null);

  const hiddenQrRef = useRef<QRCode>(null);
  const qrRef = useRef<QRCode>(null);

  const getInfo = useCallback(() => carService.fullInfo(Number(id)), [id]);
  const info = useAPI(getInfo);

  const downloadQR = useCallback(async () => {
    if (qrRef.current && isWeb) {
      if (downloadFileTelegram.isAvailable()) {
        await downloadFileTelegram(
          (qrRef.current as any).canvasRef.current.toDataURL('png'),
          `${info?.no}-qr.png`
        );
      } else {
        qrRef.current.download('png', `${info?.no}-qr.png`);
      }
    }
  }, [info?.no]);

  const downloadPlate = useCallback(async () => {
    if (canvasRef.current && isWeb) {
      await downloadFile(canvasRef.current.toDataURL('png'), `${info?.no}-автовизитка.png`);
    }
  }, [info?.no]);

  const [canvasLoaded, setCanvasLoaded] = useState(false);

  const generateQR = useCallback(async () => {
    if (info?.no && canvasRef.current && templateRef.current && hiddenQrRef.current) {
      const canvas = canvasRef.current;

      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // ctx.clearRect(0, 0, canvas.width, canvas.height);

          const svg = await Canvg.from(
            ctx,
            (templateRef.current.elementRef as any).current.outerHTML,
            { scaleWidth: 1858, scaleHeight: 662 }
          );

          await svg.render();

          const qrCanvas = (hiddenQrRef.current as any).canvasRef.current as HTMLCanvasElement;

          ctx.drawImage(qrCanvas, 1401, 102, 365, 365);

          canvas.style.height = 'auto';
          canvas.style.width = '100%';
        }
      }
    }
  }, [info?.no]);

  useEffect(() => {
    generateQR().then(() => {
      setCanvasLoaded(true);
    });
  }, [generateQR]);

  return (
    <PageView fullHeight>
      <Stack.Screen
        options={{
          title: info?.no ? `${info.no}: QR-код` : 'QR-код автомобиля'
        }}
      />
      {info ? (
        <>
          <QRCode
            value={`${PRODUCTION_URL}/g/${info.code}?from=qr`}
            size={200}
            qrStyle='fluid'
            ecLevel='H'
            eyeRadius={15}
            fgColor={'#fff'}
            bgColor='transparent'
            logoWidth={100}
            logoHeight={100}
            quietZone={0}
            removeQrCodeBehindLogo={true}
            logoPaddingStyle='square'
            ref={hiddenQrRef}
            style={{ display: 'none' }}
          />

          <QRTemplate svgRef={templateRef} />
          <StyledCanvas ref={canvasRef}></StyledCanvas>
          {canvasLoaded && (
            <CenterContainer>
              <Button onClick={downloadPlate}>Скачать автовизитку</Button>
            </CenterContainer>
          )}
          <QRCodeContainer>
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

            <CenterContainer>
              <Button onClick={downloadQR}>Скачать QR-код</Button>
            </CenterContainer>
          </QRCodeContainer>
        </>
      ) : (
        <Loading />
      )}
    </PageView>
  );
}
