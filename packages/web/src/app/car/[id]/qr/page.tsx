import { forbidden, notFound } from 'next/navigation';
import { carService } from '@/services';
import { getUserFromRequest } from '@/utils/auth';
import { PageContainer } from '@/ui/Styled';
import { QRCodePage } from '@/components/QRCode';

export default async function CarQRPage({ params }: PromiseParams<{ id: string }>) {
  const { id } = await params;
  const idNumber = Number(id);
  if (!idNumber) return notFound();

  const user = await getUserFromRequest();

  if (!user) {
    return forbidden();
  }

  try {
    const info = await carService.fullInfoApi(idNumber);

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
}
