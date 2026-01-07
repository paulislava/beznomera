'use client';

import { carService } from '@/services';
import { CarMessageAnswerType, CarMessageBody } from '@shared/car/car.types';
import React, { FC, useCallback, useContext, useMemo } from 'react';
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
import FormField from '@/ui/FormField/FormField';
import { Form } from '@/ui/FormContainer/FormContainer';
import { FormApi } from 'final-form';
import { CarInfoProps } from './CarInfo.types';
import { SelectField } from '@/ui/Select/SelectField';
import { AuthContext } from '@/context/Auth/Auth.context';

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
  padding: 20px;
  min-height: 100%;
`;

const Field = FormField<CarMessageBody>;
const Select = SelectField<CarMessageBody>;

export const CarMessagePage: FC<CarInfoProps> = ({ code, info }) => {
  const eventData = useMemo(() => ({ carId: info?.id, code }), [info, code]);
  const { user } = useContext(AuthContext);

  const answerTypesOptions = useMemo(
    () => [
      user
        ? { label: 'Анонимно через бот', value: CarMessageAnswerType.BOT }
        : { label: 'Не получать ответ', value: CarMessageAnswerType.NO },
      { label: 'По телефону', value: CarMessageAnswerType.TEL },
      { label: 'На E-mail', value: CarMessageAnswerType.EMAIL }
    ],
    [user]
  );

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
                text: data.text,
                answerType: data.answerType,
                tel: data.tel,
                email: data.email
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
    <Form onSubmit={sendHandler}>
      {({ values, dirtySinceLastSubmit, submitSucceeded }) => (
        <ChatContainer>
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

              <Select
                name='answerType'
                options={answerTypesOptions}
                defaultValue={answerTypesOptions[0]?.value}
                label='Получить ответ'
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
        </ChatContainer>
      )}
    </Form>
  );
};
