import { notFound } from 'next/navigation';
import { carService } from '@/services';
import { PageContainer } from '@/ui/Styled';
import { QRCodePage } from '@/components/QRCode';
import { AuthComponent, withUser } from '@/context/Auth/withUser';
import { extractNumberId } from '@/utils/params';

const CarQRPage: AuthComponent<PromiseParams<{ id: number }>> = async ({ params, user }) => {
  const id = await extractNumberId(params);

  try {
    const info = await carService.fullInfoApi(id);

    if (info.owner.id !== user?.userId) {
      return notFound();
    }

    return (
      <PageContainer>
        <QRCodePage info={info} />
      </PageContainer>
    );
  } catch (e) {
    console.error(e);
    return notFound();
  }
};

export default withUser(CarQRPage);
