'use client';

import React, { useCallback } from 'react';
import { Form } from '@/ui/FormContainer/FormContainer';
import { useRouter } from 'next/navigation';
import { BrandInfo, EditCarInfo } from '@shared/car/car.types';
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
import { SelectField } from '@/ui/Select/SelectField';
import { revalidateCarPages } from '@/utils/paths';

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
  brands: BrandInfo[];
}

const Field = FormField<EditCarInfo>;
const Select = SelectField<EditCarInfo>;

export function CarEditForm({ initialData, carId, brands }: CarEditFormProps) {
  const router = useRouter();

  const onSubmit = useCallback(
    async (data: EditCarInfo, form: FormApi<EditCarInfo>) => {
      try {
        await carService.update(data, carId);
        showSuccessMessage('Успех!', 'Автомобиль успешно обновлен');
        form.restart(data);

        await revalidateCarPages(carId, data.code);

        router.push(`/car/${carId}`);
      } catch (error) {
        console.error('Ошибка при обновлении автомобиля:', error);
        showErrorMessage('Ошибка!', 'Ошибка при обновлении автомобиля');
      }
    },
    [carId, router]
  );

  return (
    <div>
      <Title>Редактирование автомобиля</Title>
      <Form initialValues={initialData} onSubmit={onSubmit}>
        {({ handleSubmit, pristine, submitting }) => (
          <>
            <Select
              name='brand'
              label='Марка'
              options={brands}
              optionKey='id'
              optionValue='title'
              required
            />
            <Field name='no' label='Гос. номер' required />
            <Field name='model' label='Модель' required />
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
