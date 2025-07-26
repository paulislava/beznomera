'use client';

import React, { useCallback } from 'react';
import { Form } from '@/ui/FormContainer/FormContainer';
import { useRouter } from 'next/navigation';
import { EditCarInfo } from '@shared/car/car.types';
import { carService } from '@/services';
import { Button } from '@/ui/Button';
import FormField from '@/ui/FormField/FormField';
import { CarColorPicker } from '@/components/CarColorPicker';
import { CarExternalImage } from '@/components/CarDetails';
import { PRODUCTION_URL } from '@/constants/site';
import { FormApi } from 'final-form';
import styled from 'styled-components';
import { showErrorMessage, showSuccessMessage } from '@/utils/messages';
import { ButtonsRow } from '@/ui/Styled';

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
`;

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
`;

interface CarEditFormProps {
  initialData: EditCarInfo;
  carId: number;
  revalidatePages?: (carId: number, code: string) => Promise<void>;
}

const Field = FormField<EditCarInfo>;

export function CarEditForm({ initialData, carId, revalidatePages }: CarEditFormProps) {
  const router = useRouter();

  const onSubmit = useCallback(
    async (data: EditCarInfo, form: FormApi<EditCarInfo>) => {
      try {
        await carService.update(data, carId);
        showSuccessMessage('Успех!', 'Автомобиль успешно обновлен');
        form.restart(data);

        // Ревалидируем страницы через серверное действие
        if (revalidatePages) {
          await revalidatePages(carId, data.code);
        }

        router.push(`/car/${carId}`);
      } catch (error) {
        console.error('Ошибка при обновлении автомобиля:', error);
        showErrorMessage('Ошибка!', 'Ошибка при обновлении автомобиля');
      }
    },
    [carId, router, revalidatePages]
  );

  return (
    <div>
      <Title>Редактирование автомобиля</Title>
      <Form initialValues={initialData} onSubmit={onSubmit}>
        {({ handleSubmit, pristine, submitting }) => (
          <>
            <Field name='no' label='Гос. номер' />
            <Field name='model' label='Модель' />
            <Field name='version' label='Версия' />
            <Field name='year' type='number' label='Год выпуска' />
            <Field name='imageRatio' type='number' step='0.01' label='Соотношение сторон' />
            <Field name='imageUrl' type='url' label='Ссылка на изображение' />
            <Field name='code' label='URL-адрес' beforeText={`${PRODUCTION_URL}/g/`} />

            {initialData.imageUrl ? (
              <ImageContainer>
                <CarExternalImage
                  $aspectRatio={initialData.imageRatio}
                  src={initialData.imageUrl}
                  alt='Изображение автомобиля'
                  width={400}
                  height={142}
                />
              </ImageContainer>
            ) : (
              <Field name='color' component={CarColorPicker} />
            )}

            <ButtonsRow>
              <Button onClick={handleSubmit} disabled={pristine || submitting}>
                Сохранить
              </Button>
            </ButtonsRow>
          </>
        )}
      </Form>
    </div>
  );
}
