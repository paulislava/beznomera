import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;

  return {
    title: `Машина ${code}`,
    description: `Информация о машине с кодом ${code}`,
    openGraph: {
      title: `Машина ${code}`,
      description: `Информация о машине с кодом ${code}`,
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