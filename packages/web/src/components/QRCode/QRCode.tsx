'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/ui/Button';
import { QRCode } from 'react-qrcode-logo';
import { PRODUCTION_URL } from '@/constants/site';
import { carService } from '@/services';
import { QRTemplate } from '@/components/QRTemplate';
import { Canvg } from 'canvg';
import { CenterContainer } from '@/ui/Styled';
import { downloadFile } from '@/utils/downloadFile';
import { uploadFile } from '@/utils/files';
import { FileFolder } from '@shared/file/file.types';
import { FullCarInfo } from '@shared/car/car.types';
import { useThemeName } from '@/themes/utils';

const QRCodeContainer = styled.div`
  margin: 20px 0;
  align-items: center;
`;

const StyledCanvas = styled.canvas`
  margin-bottom: 20px;
  display: none;
`;

const ButtonsRow = styled(CenterContainer)`
  flex-flow: row wrap;
  gap: 10px;
`;

type QRCodePageProps = {
  info: FullCarInfo;
};

export const QRCodePage = ({ info }: QRCodePageProps) => {
  const theme = useThemeName();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const templateRef = useRef<SVGSVGElement>(null);

  const hiddenQrRef = useRef<QRCode>(null);
  const qrRef = useRef<QRCode>(null);

  const sendQR = useCallback(async () => {
    if (qrRef.current) {
      const dataUrl = (qrRef.current as any).canvasRef.current.toDataURL('png');

      await carService.sendQR({ image: dataUrl }, info.id);
    }
  }, [info.id]);

  const downloadQR = useCallback(
    () =>
      new Promise<void>(resolve => {
        if (qrRef.current) {
          (qrRef.current as any).canvasRef.current.toBlob(async (blob: Blob) => {
            if (!blob) {
              throw new Error('Blob is null');
            }
            const file = new File([blob], `${info.no}-qr.png`, { type: 'image/png' });

            const fileInfo = await uploadFile(file, FileFolder.Temp);

            await downloadFile(fileInfo.url, `${info.no}-qr.png`);
            resolve();
          });
        }
      }),
    [info.no]
  );

  const sendPlate = useCallback(async () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('png');

      await carService.sendPlate({ image: dataUrl }, info.id);
    }
  }, [info.id]);

  const downloadPlate = useCallback(
    () =>
      new Promise<void>(resolve => {
        if (canvasRef.current) {
          canvasRef.current.toBlob(async blob => {
            if (!blob) {
              throw new Error('Blob is null');
            }

            const file = new File([blob], `${info.no}-автовизитка.png`, { type: 'image/png' });

            const fileInfo = await uploadFile(file, FileFolder.Temp);

            await downloadFile(fileInfo.url, `${info.no}-автовизитка.png`);
            resolve();
          });
        }
      }),
    [info.no]
  );

  const [canvasLoaded, setCanvasLoaded] = useState(false);

  const generateQR = useCallback(async () => {
    if (info?.no && canvasRef.current && templateRef.current && hiddenQrRef.current) {
      const canvas = canvasRef.current;

      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // ctx.clearRect(0, 0, canvas.width, canvas.height);

          const svg = await Canvg.from(ctx, templateRef.current.outerHTML, {
            scaleWidth: 1858,
            scaleHeight: 662
          });

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
        <ButtonsRow>
          <Button onClick={sendPlate}>Отправить в Telegram</Button>
          <Button onClick={downloadPlate} view='glass'>
            Скачать автовизитку
          </Button>
        </ButtonsRow>
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
          logoPaddingStyle='square'
          ref={qrRef}
        />
      </QRCodeContainer>
      <ButtonsRow>
        <Button onClick={sendQR}>Отправить в Telegram</Button>
        <Button onClick={downloadQR} view='glass'>
          Скачать QR-код
        </Button>
      </ButtonsRow>
    </>
  );
};
