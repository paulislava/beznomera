import { ExtendedCarInfo } from '@shared/car/car.types';
import { RequestUser } from '@shared/user/user.types';

export const findUserInDrivers = (info: ExtendedCarInfo, user: RequestUser) => {
  const hasMainOwnerRights = user.isAdmin || info.owner.id === user.userId;

  const driverInfo = !hasMainOwnerRights
    ? info.drivers.find(driver => driver.id === user.userId)
    : null;

  return { driverInfo, hasMainOwnerRights };
};
