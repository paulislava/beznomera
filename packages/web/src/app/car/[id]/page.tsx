import { notFound } from 'next/navigation';
import { carService } from '@/services';
import { CarFullInfo } from '@/components/CarInfo/CarFullInfo';
import { AuthProps, withUser } from '@/context/Auth/withUser';
import { findUserInDrivers } from '@/utils/car';

async function CarPage({ params, user }: PromiseParams<{ id: string }> & AuthProps) {
  const { id } = await params;
  const idNumber = Number(id);
  if (!idNumber) return notFound();

  try {
    const info = await carService.fullInfoApi(idNumber);

    const { driverInfo, hasMainOwnerRights } = findUserInDrivers(info, user);

    if (!hasMainOwnerRights && !driverInfo) {
      return notFound();
    }

    return (
      <CarFullInfo
        user={user}
        info={info}
        hasOwnerRights={hasMainOwnerRights || driverInfo?.isOwner || false}
      />
    );
  } catch (e) {
    console.error(e);
    return notFound();
  }
}

export default withUser(CarPage);
