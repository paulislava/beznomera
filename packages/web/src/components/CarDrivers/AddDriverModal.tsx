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

export interface DriverRole {
  value: string;
  label: string;
}

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

// const DRIVER_ROLES: DriverRole[] = [
//   { value: 'driver', label: 'Водитель' },
//   { value: 'owner', label: 'Владелец' }
// ];

const Field = FormField<FormData>;

export const AddDriverModal: React.FC<AddDriverModalProps> = ({
  isOpen,
  onClose,
  carId,
  eventData = {},
  onSuccess
}) => {
  const onSubmit = useCallback(
    async (data: FormData, form: FormApi<FormData>) => {
      try {
        // Сначала ищем пользователя по нику или ID
        const user = await userService.checkUsername(data.username.trim()).catch(() => false);

        if (!user) {
          showErrorMessage('Ошибка', 'Пользователь с таким ником или ID не найден');
          return;
        }
        // Добавляем пользователя как водителя
        await carService.addDriverByUsername(
          {
            username: data.username.trim()
          },
          carId
        );

        handleEvent('add_driver_success', {
          carId,
          username: data.username.trim(),
          role: data.role.value,
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
          username: data.username.trim(),
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
                  disabled={submitting}
                />
              </S.Field>
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
