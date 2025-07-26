import { notFound, redirect } from 'next/navigation';
import { carService } from '@/services';
import { getUserFromRequest } from '@/utils/auth';
import { CarFullInfo } from '@/components/CarInfo/CarFullInfo';

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

export default async function CarPage({ params }: PromiseParams<{ id: string }>) {
  const { id } = await params;
  const idNumber = Number(id);
  if (!idNumber) return notFound();

  const user = await getUserFromRequest();

  if (!user) {
    return redirect('/auth?redirect=/car/' + idNumber);
  }

  try {
    const info = await carService.fullInfoApi(idNumber);

    if (info.owner.id !== user?.userId) {
      return notFound();
    }

    return <CarFullInfo info={info} />;
  } catch (e) {
    console.error(e);
    return notFound();
  }
}
