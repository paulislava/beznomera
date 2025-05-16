import { OptionsGenerator } from '@/ui/Select';
import { carService } from '@/services';

export const getBrandsOptions: OptionsGenerator<typeof carService.brands> = async () => {
  const brands = await carService.brands();
  return brands.map(brand => ({
    value: brand.id,
    label: brand.title
  }));
};
