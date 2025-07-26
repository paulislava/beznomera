import { notFound, redirect } from 'next/navigation';
import { carService } from '@/services';
import { getUserFromRequest } from '@/utils/auth';
import { CarEditForm } from '@/components/CarEditForm/CarEditForm';
import { revalidatePath } from 'next/cache';

// Серверное действие для ревалидации страниц
async function revalidateCarPages(carId: number, code: string) {
  'use server';
  revalidatePath(`/car/${carId}/edit`);
  console.log('revalidated /car/${carId}/edit');
  revalidatePath(`/car/${carId}`);
  revalidatePath(`/g/${code}`);
  revalidatePath(`/g/${code}/chat`);
}

export async function generateStaticParams() {
  try {
    const cars = await carService.list();
    return cars.map(car => ({
      id: car.id
    }));
  } catch {
    return [];
  }
}

export default async function CarEditPage({ params }: PromiseParams<{ id: string }>) {
  const { id } = await params;
  const idNumber = Number(id);
  if (!idNumber) return notFound();

  const user = await getUserFromRequest();

  if (!user) {
    return redirect('/auth?redirect=/car/' + idNumber + '/edit');
  }

  try {
    const info = await carService.infoForUpdateApi(idNumber);

    // Проверяем, что пользователь является владельцем автомобиля
    if (info.ownerId !== user.userId) {
      return notFound();
    }

    return <CarEditForm initialData={info} carId={idNumber} revalidatePages={revalidateCarPages} />;
  } catch (e) {
    console.error(e);
    return notFound();
  }
}
