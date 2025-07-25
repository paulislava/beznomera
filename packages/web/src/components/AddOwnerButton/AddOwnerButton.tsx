'use client';

import React, { useCallback, useState } from 'react';
import Button from '@/ui/Button/Button';
import { requestContactPromise } from '@/utils/telegram';
import { carService } from '@/services';
import { showResponseMessage } from '@/utils/messages';
import { handleEvent } from '@/utils/log';
import type { TelegramContact, AddOwnerBody } from '@shared/car/car.types';

interface AddOwnerButtonProps {
  carId: number;
  eventData?: Record<string, any>;
}

export const AddOwnerButton: React.FC<AddOwnerButtonProps> = ({ carId, eventData = {} }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddOwner = useCallback(async () => {
    if (!window.Telegram?.WebApp) {
      alert('Эта функция доступна только в Telegram Web App');
      return;
    }

    setIsLoading(true);

    try {
      const result = await requestContactPromise();
      const contactRaw = result?.contact;
      if (!contactRaw) {
        alert('Не удалось получить контакт');
        return;
      }
      const contact: TelegramContact = {
        id: contactRaw.user_id,
        first_name: contactRaw.first_name,
        last_name: contactRaw.last_name,
        username: contactRaw.username,
        phone_number: contactRaw.phone_number,
      };
      const body: AddOwnerBody = {
        contact,
        carId,
      };
      await carService.addOwner(body);
      handleEvent('add_owner_success', { carId, ...eventData });
      alert('Владелец успешно добавлен!');
    } catch (error: any) {
      console.error('Failed to add owner:', error);
      handleEvent('add_owner_error', { carId, error, ...eventData });
      showResponseMessage(error?.message || error);
    } finally {
      setIsLoading(false);
    }
  }, [carId, eventData]);

  return (
    <Button
      fullWidth
      view='secondary'
      onClick={handleAddOwner}
      disabled={isLoading}
      event='add_owner'
      eventParams={{ carId, ...eventData }}
    >
      {isLoading ? 'Добавление...' : 'Добавить владельца'}
    </Button>
  );
}; 