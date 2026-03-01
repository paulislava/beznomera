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
  revalidatePath('/panel');
};

export async function revalidateCarPages(carId: number, code: string) {
  revalidateHome();
  console.log(`Car ${carId} revalidated`);
  revalidatePath(`/car/${carId}`);
  revalidatePath(`/car/${carId}/qr`);
  revalidatePath(`/g/${code}`);
  revalidatePath(`/g/${code}/chat`);
}
