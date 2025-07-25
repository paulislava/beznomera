import { notFound } from 'next/navigation';
import { carService } from '@/services';
import { CarInfoPage } from '@/components/CarInfo';
import { AddOwnerButton } from '@/components/AddOwnerButton';

export default async function CarPage({ params }: PromiseParams<{ id: string }>) {
  const { id } = await params;
  const idNumber = Number(id);
  if (!idNumber) return notFound();

  try {
    const info = await carService.fullInfoApi(idNumber);
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
