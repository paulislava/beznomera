'use client';

import React, { useCallback } from 'react';
import { FormApi } from 'final-form';
import { Form } from '@/ui/FormContainer/FormContainer';
import { Button } from '@/ui/Button';
import FormField from '@/ui/FormField/FormField';
import { carService, userService } from '@/services';
import { showResponseMessage, showErrorMessage, showSuccessMessage } from '@/utils/messages';
import { handleEvent } from '@/utils/log';
import * as S from './AddDriverModal.styled';
import { SelectField } from '@/ui/Select/SelectField';
import { DriverRole } from '@shared/car/car.types';
import { SelectOption } from '@/ui/Select/Select.types';

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  carId: number;
  eventData?: Record<string, any>;
  onSuccess?: () => void;
}

interface FormData {
  username: string;
  role: DriverRole;
}

const driverRoleOptions: SelectOption<DriverRole>[] = [
  { value: DriverRole.DRIVER, label: 'Водитель' },
  { value: DriverRole.OWNER, label: 'Владелец' }
];

const Field = FormField<FormData>;
const Select = SelectField<FormData>;

export const AddDriverModal: React.FC<AddDriverModalProps> = ({
  isOpen,
  onClose,
  carId,
  eventData = {},
  onSuccess
}) => {
  const onSubmit = useCallback(
    async (data: FormData, form: FormApi<FormData>) => {
      const username = data.username.trim();

      try {
        // Сначала ищем пользователя по нику или ID
        const user = await userService.checkUsername(username).catch(() => false);

        if (!user) {
          showErrorMessage('Ошибка', 'Пользователь с таким ником или ID не найден');
          return;
        }
        // Добавляем пользователя как водителя
        await carService.addDriverByUsername(
          {
            username,
            role: data.role
          },
          carId
        );

        handleEvent('add_driver_success', {
          carId,
          username,
          // role: data.role.value,
          ...eventData
        });

        showSuccessMessage('Успех', 'Водитель успешно добавлен!');

        // Сбрасываем форму
        form.reset();

        // Закрываем модальное окно и вызываем callback
        onClose();
        onSuccess?.();
      } catch (error: any) {
        console.error('Failed to add driver:', error);
        handleEvent('add_driver_error', {
          carId,
          username,
          // role: data.role.value,
          error,
          ...eventData
        });
        showResponseMessage(error?.message || error);
      }
    },
    [carId, eventData, onClose, onSuccess]
  );

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <S.Overlay onClick={handleClose}>
      <S.Modal onClick={e => e.stopPropagation()}>
        <S.Header>
          <S.Title>Добавить водителя</S.Title>
          <S.CloseButton onClick={handleClose}>×</S.CloseButton>
        </S.Header>

        <Form onSubmit={onSubmit}>
          {({ submitting, pristine }) => (
            <>
              <S.Field>
                <Field
                  name='username'
                  label='Ник или ID пользователя'
                  placeholder='Введите ник или ID'
                  required
                />
              </S.Field>
              <Select
                name='role'
                options={driverRoleOptions}
                defaultValue={DriverRole.DRIVER}
                label='Права пользователя'
              />
              <S.Actions>
                <Button type='button' view='secondary' onClick={handleClose} disabled={submitting}>
                  Отмена
                </Button>
                <Button type='submit' view='primary' disabled={submitting || pristine}>
                  {submitting ? 'Добавление...' : 'Добавить'}
                </Button>
              </S.Actions>
            </>
          )}
        </Form>
      </S.Modal>
    </S.Overlay>
  );
};
