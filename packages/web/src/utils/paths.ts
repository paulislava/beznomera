import { carService } from '@/services';

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
