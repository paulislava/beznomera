import { CarsList } from '@/components/CarsList';
import { getUserFromRequest } from '@/utils/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await getUserFromRequest();

  if (user) {
    return <CarsList />;
  } else {
    redirect('/auth');
  }
}
