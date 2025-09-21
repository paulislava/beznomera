'use client';

import React, { useCallback, useState } from 'react';
import { Button } from '@/ui/Button';
import { requestContactPromise } from '@/utils/telegram';
import { carService } from '@/services';
import { showResponseMessage, showErrorMessage, showSuccessMessage } from '@/utils/messages';
import { handleEvent } from '@/utils/log';
import type { TelegramContact, AddDriverBody } from '@shared/car/car.types';

interface AddDriverButtonProps {
  carId: number;
  eventData?: Record<string, any>;
}

export const AddDriverButton: React.FC<AddDriverButtonProps> = ({ carId, eventData = {} }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddDriver = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await requestContactPromise();
      const contactRaw = result?.parsed?.contact;
      if (!contactRaw) {
        showErrorMessage('Ошибка', 'Не удалось получить контакт');
        return;
      }
      const contact: TelegramContact = {
        id: contactRaw.user_id,
        first_name: contactRaw.first_name,
        last_name: contactRaw.last_name,
        username: contactRaw.username?.toString(),
        phone_number: contactRaw.phone_number
      };
      const body: AddDriverBody = {
        contact,
        carId
      };
      await carService.addDriver(body);
      handleEvent('add_driver_success', { carId, ...eventData });
      showSuccessMessage('Успех', 'Водитель успешно добавлен!');

      // Перезагружаем страницу для обновления списка водителей
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to add driver:', error);
      handleEvent('add_driver_error', { carId, error, ...eventData });
      showResponseMessage(error?.message || error);
    } finally {
      setIsLoading(false);
    }
  }, [carId, eventData]);

  return (
    <Button
      view='secondary'
      onClick={handleAddDriver}
      disabled={isLoading}
      event='add_driver'
      eventParams={{ carId, ...eventData }}
    >
      {isLoading ? '...' : '+'}
    </Button>
  );
};
