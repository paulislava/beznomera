import { AdminButton } from '@/components/AdminButton';
import { CarsList } from '@/components/CarsList';
import { AuthComponent, withUser } from '@/context/Auth/withUser';
import { carService } from '@/services';

const Home: AuthComponent<unknown> = async ({ user }) => {
  const cars = await carService.userList(user.userId);

  return (
    <>
      <CarsList cars={cars} />
      {user.isAdmin && <AdminButton />}
    </>
  );
};

export default withUser(Home);
