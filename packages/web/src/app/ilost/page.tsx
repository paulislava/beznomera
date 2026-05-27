import { cookies } from 'next/headers';
import { AuthComponent, withUser } from '@/context/Auth/withUser';
import { createApi } from '@/services';
import { AUTH_COOKIE_NAME } from '@/helpers/constants';
import { ILostTracker } from '@/components/ILost/ILostTracker';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'I Forgot'
};

const ILostPage: AuthComponent = async () => {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const api = createApi(token);

  const [stats, items] = await Promise.all([api.lost.getStats(), api.lost.getItems()]);

  return <ILostTracker initialStats={stats} initialItems={items} />;
};

export default withUser(ILostPage);
