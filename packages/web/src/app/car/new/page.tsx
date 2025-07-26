import React from 'react';

import { ServerAuthGuard } from '@/components/ServerAuthGuard';
import { CarCreateForm } from '@/components/CarCreateForm/CarCreateForm';

export default function NewCarPage() {
  return (
    <ServerAuthGuard redirectTo='/car/new'>
      <CarCreateForm />
    </ServerAuthGuard>
  );
}
