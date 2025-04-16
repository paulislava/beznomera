import React, { useCallback, ComponentType } from 'react';
import { carService } from '@/services';
import { PageView } from '@/components/Themed';
import { Form, Field as RawField } from 'react-final-form';
import FormField from '@/ui/FormField/FormField';
import { EditCarInfo } from '@paulislava/shared/car/car.types';
import { Button } from '@/ui/Button';
import { FormFieldProps } from '@/ui/FormField/FormField.types';
import { CarColorPicker } from '@/components/CarColorPicker';
import { PRODUCTION_URL } from '@/constants/site';
import { router } from 'expo-router';
import { FORM_ERROR } from 'final-form';
import { ResponseWithCode } from '@shared/responses';
import { SelectField } from '@/ui/Select';
import { SelectFormFieldProps } from '@/ui/Select/Select.types';
import { getBrandsOptions } from '@/mappers/car.mapper';

type Data = EditCarInfo;

const Field = FormField as ComponentType<FormFieldProps<Data>>;
const Select = SelectField as ComponentType<SelectFormFieldProps<Data>>;

export default function CarCreateScreen(): JSX.Element {
  const onSubmit = useCallback((data: Data) => {
    return carService
      .create(data)
      .then(({ id }) => {
        router.push(`/car/${id}/`);
      })
      .catch((res: ResponseWithCode) => {
        if (res.errors) {
          return res.errors;
        }
        return { [FORM_ERROR]: 'Произошла ошибка при создании автомобиля' };
      });
  }, []);

  return (
    <PageView fullHeight center>
      <Form<Data> onSubmit={onSubmit}>
        {({ handleSubmit, pristine, submitting }) => (
          <>
            <Field name='no' label='Гос. номер' />
            <Select name='brand' label='Марка' loader={getBrandsOptions} />
            <Field name='model' label='Модель' />
            <Field name='version' label='Версия' />
            <Field name='year' type='number' label='Год выпуска' />
            <Field name='imageRatio' type='number' label='Соотношение сторон' />
            <Field name='imageUrl' label='Ссылка на изображение' />
            <Field name='code' label='URL-адрес' beforeText={`${PRODUCTION_URL}/g/`} />
            <RawField name='color' component={CarColorPicker} />
            <Button onClick={handleSubmit} disabled={pristine || submitting}>
              Добавить
            </Button>
          </>
        )}
      </Form>
    </PageView>
  );
}
