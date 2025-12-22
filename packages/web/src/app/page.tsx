import { CarsList } from '@/components/CarsList';
import { AuthComponent, withUser } from '@/context/Auth/withUser';
import { carService } from '@/services';

const Home: AuthComponent = async ({ user }) => {
  const cars = await carService.userList(user.userId);

  return <CarsList cars={cars} />;
};

export default withUser(Home);
