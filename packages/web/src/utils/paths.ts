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

export const revalidateHome = () => {
  'use server';

  revalidatePath('/');
};
