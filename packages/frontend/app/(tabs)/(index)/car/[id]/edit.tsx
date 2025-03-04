import React, { useCallback, ComponentType } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useAPI } from '@/utils/api';
import { carService } from '@/services';
import { PageView } from '@/components/Themed';
import Head from 'expo-router/head';
import { CarExternalImage } from '@/components/CarDetails';
import { Form, Field as RawField } from 'react-final-form';
import FormField from '@/ui/FormField/FormField';
import { EditCarInfo } from '@paulislava/shared/car/car.types';
import { Button } from '@/ui/Button';
import { FormFieldProps } from '@/ui/FormField/FormField.types';
import { CarColorPicker } from '@/components/CarColorPicker';
import { PRODUCTION_URL } from '@/constants/site';
import { FormApi } from 'final-form';
import useNeedAuth from '@/hooks/useNeedAuth';
type Data = EditCarInfo;

const Field = FormField as ComponentType<FormFieldProps<Data>>;

export default function CarEditScreen(): JSX.Element {
  useNeedAuth();

  const { id } = useLocalSearchParams<{ id: string }>();
  const getInfo = useCallback(() => carService.infoForUpdate(Number(id)), [id]);
  const info = useAPI(getInfo);

  const onSubmit = useCallback((data: Data, form: FormApi<Data>) => {
    return carService.update(data, Number(id)).then(() => {
      alert('Автомобиль успешно обновлен');
      form.restart(data);
      return true;
    });
  }, []);

  return (
    <PageView fullHeight center>
      <Stack.Screen
        options={{
          title: `${info?.no ?? 'Мое авто'}: редактирование`
        }}
      />
      <Head>
        <title>{info?.no ?? 'Мое авто'}: редактирование</title>
      </Head>
      {info && (
        <Form<Data> initialValues={info} onSubmit={onSubmit}>
          {({ handleSubmit, pristine, submitting }) => (
            <>
              <Field name='no' label='Гос. номер' />
              <Field name='model' label='Модель' />
              <Field name='version' label='Версия' />
              <Field name='year' type='number' label='Год выпуска' />
              <Field name='imageRatio' type='number' label='Соотношение сторон' />
              <Field name='imageUrl' label='Ссылка на изображение' />
              <Field name='code' label='URL-адрес' beforeText={`${PRODUCTION_URL}/g/`} />
              {info.imageUrl ? (
                <CarExternalImage
                  $aspectRatio={info.imageRatio}
                  resizeMode='contain'
                  source={{ uri: info.imageUrl }}
                />
              ) : (
                <RawField name='color' component={CarColorPicker} />
              )}
              <Button onClick={handleSubmit} disabled={pristine || submitting}>
                Сохранить
              </Button>
            </>
          )}
        </Form>
      )}
    </PageView>
  );
}
