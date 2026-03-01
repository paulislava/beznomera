import { notFound } from 'next/navigation';
import { carService } from '@/services';
import { CarEditForm } from '@/components/CarEditForm/CarEditForm';
import { extractNumberId } from '@/utils/params';
import { AuthComponent, withUser } from '@/context/Auth/withUser';

const CarEditPage: AuthComponent<PromiseParams<{ id: number }>> = async ({ params, user }) => {
  const id = await extractNumberId(params);

  try {
    const info = await carService.infoForUpdateApi(id);

    const hasMainOwnerRights = info.ownerId === user.userId || !user.isAdmin;

    const driverInfo = !hasMainOwnerRights
      ? info.drivers?.find(driver => driver.id === user.userId)
      : null;

    if (!hasMainOwnerRights && !driverInfo?.isOwner) {
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
