'use client';

import React, { useState } from 'react';
import { Button } from '@/ui/Button';
import { AddDriverModal } from './AddDriverModal';
import { handleEvent } from '@/utils/log';
import type { AddDriverButtonProps } from './AddDriverButton.types';

export const AddDriverButton: React.FC<AddDriverButtonProps> = ({
  carId,
  eventData = {},
  onSuccess
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddDriver = () => {
    handleEvent('add_driver_click', { carId, ...eventData });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    handleEvent('add_driver_success', { carId, ...eventData });
    onSuccess?.();
  };

  return (
    <>
      <Button
        view='secondary'
        onClick={handleAddDriver}
        event='add_driver'
        eventParams={{ carId, ...eventData }}
      >
        +
      </Button>

      <AddDriverModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        carId={carId}
        eventData={eventData}
        onSuccess={handleSuccess}
      />
    </>
  );
};
