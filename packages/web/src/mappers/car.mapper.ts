import { carService } from '@/services';

export const getBrandsOptions = async () => {
  const brands = await carService.brands();
  return brands.map(brand => ({
    value: brand.id,
    label: brand.title
  }));
};
