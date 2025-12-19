import { CarsList } from '@/components/CarsList';
import { AUTH_PATHNAME } from '@/helpers/constants';
import { getUserFromRequest } from '@/utils/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await getUserFromRequest();

  console.log('user', user);

  if (user) {
    return <CarsList />;
  } else {
    redirect(AUTH_PATHNAME);
  }
}
