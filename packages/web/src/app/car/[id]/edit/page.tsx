import { notFound } from 'next/navigation';
import { carService } from '@/services';
import { CarEditForm } from '@/components/CarEditForm/CarEditForm';
import { extractNumberId } from '@/utils/params';
import { AuthComponent, withUser } from '@/context/Auth/withUser';
import { generateCarsStaticParams } from '@/utils/paths';

// Серверное действие для ревалидации страниц

export const generateStaticParams = generateCarsStaticParams;

const CarEditPage: AuthComponent<PromiseParams<{ id: number }>> = async ({ params, user }) => {
  const id = await extractNumberId(params);

  try {
    const info = await carService.infoForUpdateApi(id);

    // Проверяем, что пользователь является владельцем автомобиля
    if (info.ownerId !== user.userId) {
      return notFound();
    }

    const brands = await carService.brands();

    return <CarEditForm initialData={info} carId={id} brands={brands} />;
  } catch (e) {
    console.error(e);
    return notFound();
  }
};

export default withUser(CarEditPage);
