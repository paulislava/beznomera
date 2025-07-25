import { forbidden, notFound } from 'next/navigation';
import { carService } from '@/services';
import { CarInfoPage } from '@/components/CarInfo';
import { AddOwnerButton } from '@/components/AddOwnerButton';
import { getUserFromRequest } from '@/utils/auth';

export default async function CarPage({ params }: PromiseParams<{ id: string }>) {
  const { id } = await params;
  const idNumber = Number(id);
  if (!idNumber) return notFound();

  const user = await getUserFromRequest();

  if (!user) {
    return forbidden();
  }

  try {
    const info = await carService.fullInfoApi(idNumber);

    if (info.owner.id !== user?.userId) {
      return notFound();
    }

    return (
      <div className='center-container'>
        <CarInfoPage info={info} code={info.code} />
        <AddOwnerButton carId={info.id} eventData={{ code: info.code }} />
      </div>
    );
  } catch (e) {
    console.error(e);
    return notFound();
  }
}
