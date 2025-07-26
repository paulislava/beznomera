import { forbidden, notFound } from 'next/navigation';
import { carService } from '@/services';
import { getUserFromRequest } from '@/utils/auth';
import { CarEditForm } from '@/components/CarEditForm/CarEditForm';

export default async function CarEditPage({ params }: PromiseParams<{ id: string }>) {
  const { id } = await params;
  const idNumber = Number(id);
  if (!idNumber) return notFound();

  const user = await getUserFromRequest();

  if (!user) {
    return forbidden();
  }

  try {
    const info = await carService.infoForUpdateApi(idNumber);

    // Проверяем, что пользователь является владельцем автомобиля
    if (info.ownerId !== user.userId) {
      return notFound();
    }

    return <CarEditForm initialData={info} carId={idNumber} />;
  } catch (e) {
    console.error(e);
    return notFound();
  }
}
