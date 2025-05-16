import { carService } from '@/services';
import { Metadata } from 'next';
import { CarInfoPage } from '@/components/CarInfo';

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;

  const info = await carService.info(code);

  const title = `${info.no}: связаться с владельцем автомобиля`;
  const description = `Связаться с владельцем автомобиля ${info.no}, ${info.brandRaw || info.brand?.title} ${
    info.model || ''
  }. Уведомление в Telegram, сообщение или звонок.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    }
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params;
  const info = await carService.info(code);

  return (
    <div className="center-container">
     <CarInfoPage info={info} code={code} />
    </div>
  );
}