'use client';

import React, { useCallback } from 'react';
import { Form } from '@/ui/FormContainer/FormContainer';
import { useRouter } from 'next/navigation';
import { BrandInfo, EditCarInfo } from '@shared/car/car.types';
import { carService } from '@/services';
import { Button } from '@/ui/Button';
import FormField from '@/ui/FormField/FormField';
import { CarColorPicker } from '@/components/CarColorPicker';
import { PRODUCTION_URL } from '@/constants/site';
import { FormApi } from 'final-form';
import styled from 'styled-components';
import { showErrorMessage, showSuccessMessage } from '@/utils/messages';
import { ButtonsRow } from '@/ui/Styled';
import { revalidateHome } from '@/utils/paths';
import { SelectField } from '@/ui/SelectField/SelectField';

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
`;

const Field = FormField<EditCarInfo>;
const Select = SelectField<EditCarInfo>;

const initialValues: EditCarInfo = {
  no: '',
  model: '',
  version: '',
  year: new Date().getFullYear(),
  imageRatio: 2.8,
  imageUrl: '',
  code: '',
  color: { value: null, newValue: { r: 113, g: 142, b: 191 } },
  brand: null
};

export function CarCreateForm({ brands }: { brands: BrandInfo[] }) {
  const router = useRouter();

  const onSubmit = useCallback(
    async (data: EditCarInfo, form: FormApi<EditCarInfo>) => {
      try {
        const newCar = await carService.create(data);
        showSuccessMessage('Успех!', 'Автомобиль успешно создан');
        form.restart(initialValues);
        router.push(`/car/${newCar.id}`);
        revalidateHome();
      } catch (error) {
        console.error('Ошибка при создании автомобиля:', error);
        showErrorMessage('Ошибка!', 'Ошибка при создании автомобиля');
      }
    },
    [router]
  );

  return (
    <div>
      <Title>Добавить автомобиль</Title>
      <Form initialValues={initialValues} onSubmit={onSubmit}>
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
            <Field name='no' required label='Гос. номер' />
            <Field name='model' required label='Модель' />
            <Field name='version' label='Версия' />
            <Field name='year' type='number' label='Год выпуска' />
            <Field name='imageRatio' type='number' label='Соотношение сторон' />
            <Field name='imageUrl' type='file' label='Изображение' />
            <Field name='code' label='URL-адрес' beforeText={`${PRODUCTION_URL}/g/`} />

            <Field name='color' component={CarColorPicker} />

            <ButtonsRow>
              <Button onClick={handleSubmit} disabled={pristine || submitting}>
                Добавить автомобиль
              </Button>
            </ButtonsRow>
          </>
        )}
      </Form>
    </div>
  );
}
