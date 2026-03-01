import { AdminButton } from '@/components/AdminButton';
import { CarsList } from '@/components/CarsList';
import { AuthComponent, withUser } from '@/context/Auth/withUser';
import { carService } from '@/services';

const Panel: AuthComponent<unknown> = async ({ user }) => {
  const cars = await carService.list();

  return (
    <>
      <CarsList cars={cars} />
      {user.isAdmin && <AdminButton />}
    </>
  );
};

export default withUser(Panel, true);
