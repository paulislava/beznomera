import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { code: string } }): Promise<Metadata> {
  return {
    title: `Машина ${params.code}`,
    description: `Информация о машине с кодом ${params.code}`,
    openGraph: {
      title: `Машина ${params.code}`,
      description: `Информация о машине с кодом ${params.code}`,
    }
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params;

  return (
    <div className="center-container">
      <h1>Car {code}</h1>
    </div>
  );
}