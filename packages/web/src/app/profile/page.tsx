import { AuthComponent, withUser } from '@/context/Auth/withUser';
import { createApi } from '@/services';
import { ProfileClient } from './ProfileClient';

const api = createApi();

const ProfilePage: AuthComponent = async ({ user }) => {
  const profile = await api.user.getProfile(user.userId);

  return <ProfileClient initialProfile={profile} />;
};

export default withUser(ProfilePage);
