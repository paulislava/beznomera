import { notFound } from 'next/navigation';
import { carService } from '@/services';
import { QRCodePage } from '@/components/QRCode';
import { AuthComponent, withUser } from '@/context/Auth/withUser';
import { extractNumberId } from '@/utils/params';
import { findUserInDrivers } from '@/utils/car';

const CarQRPage: AuthComponent<PromiseParams<{ id: number }>> = async ({ params, user }) => {
  const id = await extractNumberId(params);

  try {
    const info = await carService.fullInfoApi(id);

    const { driverInfo, hasMainOwnerRights } = findUserInDrivers(info, user);

    if (!hasMainOwnerRights && !driverInfo) {
      return notFound();
    }

    return <QRCodePage info={info} />;
  } catch (e) {
    console.error(e);
    return notFound();
  }
};

export default withUser(CarQRPage);
