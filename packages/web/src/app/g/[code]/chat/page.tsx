'use client';

import { carService } from '@/services';
import { CarInfo, CarMessageBody } from '@shared/car/car.types';
import { useParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { handleEvent } from '@/utils/log';
import { showResponseMessage, showErrorMessage, showSuccessMessage } from '@/utils/messages';
import Button from '@/ui/Button/Button';

import {
  ModelRow,
  CarModelBrand,
  BrandLogo,
  CarModel,
  CarNumber,
  Nickname
} from '@/components/CarDetails';
import styled from 'styled-components';
import Head from 'next/head';
import FormField from '@/ui/FormField/FormField';
import { Form } from '@/ui/FormContainer/FormContainer';
import { FormApi } from 'final-form';

const InputContainer = styled.div`
  margin: 20px 0;
  width: 100%;
  max-width: 600px;
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
`;

const Field = FormField<CarMessageBody>;

const ChatDriverPage = () => {
  const params = useParams();
  const code = params.code as string;

  const [requested, setRequested] = useState(false);
  const [info, setInfo] = useState<CarInfo | null>(null);

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

  const sendHandler = useCallback(
    async (data: CarMessageBody, form: FormApi<CarMessageBody>) => {
      if (!data.text) {
        showErrorMessage('Ошибка', 'Введите текст сообщения!');
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const send = (location?: GeolocationPosition) => {
          carService
            .sendMessage(
              {
                coords: location && {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude
                },
                text: data.text
              },
              code
            )
            .then(() => {
              handleEvent('send_message_success', eventData);
              resolve();
              showSuccessMessage('Успех', 'Сообщение отправлено!');
            })
            .catch(res => {
              reject(res);
              showResponseMessage(res);
              handleEvent('send_message_error', { ...eventData, res });
            });
        };

        if (navigator?.geolocation) {
          navigator.geolocation.getCurrentPosition(send, () => send());
        } else {
          send();
        }
      });

      form.change('text', '');
    },
    [code, eventData]
  );

  return (
    <>
      <Head>
        <title>{info ? `${info.no}: чат с водителем` : 'Чат с водителем'}</title>
        <meta name='description' content='Отправить сообщение владельцу автомобиля' />
      </Head>
      <Form onSubmit={sendHandler}>
        {({ values, dirtySinceLastSubmit, submitSucceeded }) => (
          <ChatContainer>
            {requested && !info && <div>Ошибка: ссылка недействительна</div>}

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
                    {info.brand.logoUrl && (
                      <BrandLogo alt={info.brand.title} src={info.brand.logoUrl} />
                    )}
                    <CarModel>{info.model}</CarModel>
                  </ModelRow>
                )}

                {info.no && <CarNumber>{info.no}</CarNumber>}

                <InputContainer>
                  <Field
                    name='text'
                    label='Сообщение'
                    type='textarea'
                    placeholder='Введите ваше сообщение...'
                  />
                </InputContainer>

                <Button
                  type='submit'
                  event='send_message'
                  eventParams={eventData}
                  disabled={!values.text || (submitSucceeded && !dirtySinceLastSubmit)}
                >
                  {submitSucceeded && !dirtySinceLastSubmit ? 'Отправлено!' : 'Отправить'}
                </Button>
              </>
            )}
          </ChatContainer>
        )}
      </Form>
    </>
  );
};

export default ChatDriverPage;
