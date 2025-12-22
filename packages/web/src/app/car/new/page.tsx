import React from 'react';

import { CarCreateForm } from '@/components/CarCreateForm/CarCreateForm';
import { carService } from '@/services';
import { withUser } from '@/context/Auth/withUser';

async function NewCarPage() {
  const brands = await carService.brands();

  return <CarCreateForm brands={brands} />;
}

export default withUser(NewCarPage);
