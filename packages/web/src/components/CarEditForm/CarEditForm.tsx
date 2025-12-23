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
import { ButtonsRow, ImageContainer } from '@/ui/Styled';
import { SelectField } from '@/ui/Select/SelectField';
import { revalidateCarPages } from '@/utils/paths';
import { processFormSubmit } from '@/utils/forms';
import { FileFolder } from '@shared/file/file.types';

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
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
    async (data: EditCarInfo, form: FormApi<EditCarInfo>) =>
      processFormSubmit(
        carService.update(data, carId),
        'Автомобиль успешно обновлен',
        'Ошибка при обновлении автомобиля',
        async () => {
          form.restart(data);

          await revalidateCarPages(carId, data.code);

          router.push(`/car/${carId}`);
        }
      ),
    [carId, router]
  );

  return (
    <div>
      <Title>Редактирование автомобиля</Title>
      <Form initialValues={initialData} onSubmit={onSubmit}>
        {({ handleSubmit, pristine, submitting, values }) => (
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
            <Field name='code' label='URL-адрес' beforeText={`${PRODUCTION_URL}/g/`} />

            <Field
              name='image'
              type='file'
              label='Изображение'
              fileType='image'
              folder={FileFolder.Cars}
            />
            {values.image?.url ? (
              <ImageContainer>
                <CarExternalImage
                  $aspectRatio={values.imageRatio}
                  src={values.image?.url}
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
