import { AuthComponent, withUser } from '@/context/Auth/withUser';
import { createApi } from '@/services';
import { ILostTracker } from '@/components/ILost/ILostTracker';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'iloss'
};

const api = createApi();

const ILostPage: AuthComponent = async ({ user }) => {
  const [stats, items, itemStats] = await Promise.all([
    api.lost.getStatsForUser(user.userId),
    api.lost.getItems(),
    api.lost.getItemStatsForUser(user.userId)
  ]);

  return <ILostTracker initialStats={stats} initialItems={items} initialItemStats={itemStats} />;
};

export default withUser(ILostPage);
