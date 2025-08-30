import { carService } from '@/services';
import { Metadata } from 'next';
import { CarInfoPage } from '@/components/CarInfo';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params
}: PromiseParams<{ code: string }>): Promise<Metadata> {
  const { code } = await params;

  // Проверяем что code является валидной строкой
  if (!code || typeof code !== 'string' || code.trim() === '') {
    return {
      title: 'Ссылка не действительна',
      description: 'Ссылка на автомобиль не действительна или устарела'
    };
  }

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
    const cars = await carService.list();

    // Фильтруем только те машины у которых есть code
    return cars
      .filter(car => car && car.code.trim().length > 0)
      .map(car => ({
        code: car.code
      }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

export default async function Page({ params }: PromiseParams<{ code: string }>) {
  const { code } = await params;

  // Проверяем что code является валидной строкой
  if (!code || typeof code !== 'string' || code.trim() === '') {
    notFound();
  }

  try {
    const info = await carService.info(code);

    return <CarInfoPage info={info} code={code} />;
  } catch {
    notFound();
  }
}
