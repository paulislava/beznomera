import { cookies } from 'next/headers';
import { AuthComponent, withUser } from '@/context/Auth/withUser';
import { createApi } from '@/services';
import { AUTH_COOKIE_NAME } from '@/helpers/constants';
import { ILostTracker } from '@/components/ILost/ILostTracker';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'iloss'
};

const ILostPage: AuthComponent = async () => {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const api = createApi(token);

  const [stats, items, itemStats] = await Promise.all([
    api.lost.getStats(),
    api.lost.getItems(),
    api.lost.getItemStats()
  ]);

  return <ILostTracker initialStats={stats} initialItems={items} initialItemStats={itemStats} />;
};

export default withUser(ILostPage);
