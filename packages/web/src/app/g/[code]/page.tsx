import { carService } from '@/services';
import { Metadata } from 'next';
import { CarInfoPage } from '@/components/CarInfo';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params
}: PromiseParams<{ code: string }>): Promise<Metadata> {
  const { code } = await params;

  try {
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
        description
      }
    };
  } catch {
    return {
      title: 'Ссылка не действительна',
      description: 'Ссылка на автомобиль не действительна или устарела'
    };
  }
}

export async function generateStaticParams() {
  try {
    const codes = await carService.list();
    return codes.map(code => ({
      code
    }));
  } catch {
    return [];
  }
}

export default async function Page({ params }: PromiseParams<{ code: string }>) {
  const { code } = await params;

  try {
    const info = await carService.info(code);

    return (
      <div className='center-container'>
        <CarInfoPage info={info} code={code} />
      </div>
    );
  } catch {
    notFound();
  }
}
