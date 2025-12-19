import React from 'react';

import { ServerAuthGuard } from '@/components/ServerAuthGuard';
import { CarCreateForm } from '@/components/CarCreateForm/CarCreateForm';
import { carService } from '@/services';

export default async function NewCarPage() {
  const brands = await carService.brands();

  return (
    <ServerAuthGuard redirectTo='/car/new'>
      <CarCreateForm brands={brands} />
    </ServerAuthGuard>
  );
}
