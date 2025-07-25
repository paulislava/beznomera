import { notFound, forbidden } from 'next/navigation';
import { carService } from '@/services';
import { CarInfoPage } from '@/components/CarInfo';
import { AddOwnerButton } from '@/components/AddOwnerButton';
import { NextRequest } from 'next/server';

type PromiseParams<T> = { params: Promise<T>; request: NextRequest };

export default async function CarPage(props: PromiseParams<{ id: string }>) {
  const { params, request } = props;

  const { id } = await params;
  const idNumber = Number(id);

  // console.log(props);

  const user = request.user;

  if (!user) {
    return forbidden();
  }

  if (!idNumber) return notFound();

  try {
    const info = await carService.fullInfoApi(idNumber);

    if (info.owner.id !== user.userId) {
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
