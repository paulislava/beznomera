'use server';

import { carService } from '@/services';
import { revalidatePath } from 'next/cache';

export const generateCarsStaticParams = async () => {
  try {
    const cars = await carService.list();
    return cars.map(car => ({
      id: String(car.id)
    }));
  } catch {
    return [];
  }
};

export const revalidateHome = async () => {
  revalidatePath('/');
};

export async function revalidateCarPages(carId: number, code: string) {
  revalidatePath('/');
  revalidatePath(`/car/${carId}/edit`);
  console.log('revalidated /car/${carId}/edit');
  revalidatePath(`/car/${carId}`);
  revalidatePath(`/car/${carId}/qr`);
  revalidatePath(`/g/${code}`);
  revalidatePath(`/g/${code}/chat`);
}
