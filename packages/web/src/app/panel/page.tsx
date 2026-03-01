import { CarsList } from '@/components/CarsList';
import { AuthComponent, withUser } from '@/context/Auth/withUser';
import { carService } from '@/services';

const Panel: AuthComponent<unknown> = async () => {
  const cars = await carService.list();

  return (
    <>
      <CarsList cars={cars} showInfo />
    </>
  );
};

export default withUser(Panel, true);
