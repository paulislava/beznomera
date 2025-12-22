import { notFound } from 'next/navigation';
import { carService } from '@/services';
import { CarEditForm } from '@/components/CarEditForm/CarEditForm';
import { revalidatePath } from 'next/cache';
import { extractNumberId } from '@/utils/params';
import { AuthComponent, withUser } from '@/context/Auth/withUser';
import { generateCarsStaticParams } from '@/utils/paths';

// Серверное действие для ревалидации страниц
async function revalidateCarPages(carId: number, code: string) {
  'use server';
  revalidatePath('/');
  revalidatePath(`/car/${carId}/edit`);
  console.log('revalidated /car/${carId}/edit');
  revalidatePath(`/car/${carId}`);
  revalidatePath(`/car/${carId}/qr`);
  revalidatePath(`/g/${code}`);
  revalidatePath(`/g/${code}/chat`);
}

export const generateStaticParams = generateCarsStaticParams;

const CarEditPage: AuthComponent<PromiseParams<{ id: number }>> = async ({ params, user }) => {
  const id = await extractNumberId(params);

  try {
    const info = await carService.infoForUpdateApi(id);

    // Проверяем, что пользователь является владельцем автомобиля
    if (info.ownerId !== user.userId) {
      return notFound();
    }

    return <CarEditForm initialData={info} carId={id} revalidatePages={revalidateCarPages} />;
  } catch (e) {
    console.error(e);
    return notFound();
  }
};

export default withUser(CarEditPage);
