import { notFound } from 'next/navigation';
import { carService } from '@/services';
import { CarFullInfo } from '@/components/CarInfo/CarFullInfo';
import { AuthProps, withUser } from '@/context/Auth/withUser';
async function CarPage({ params, user }: PromiseParams<{ id: string }> & AuthProps) {
  const { id } = await params;
  const idNumber = Number(id);
  if (!idNumber) return notFound();

  try {
    const info = await carService.fullInfoApi(idNumber);

    if (info.owner.id !== user?.userId) {
      return notFound();
    }

    return <CarFullInfo user={user} info={info} />;
  } catch (e) {
    console.error(e);
    return notFound();
  }
}

export default withUser(CarPage);
