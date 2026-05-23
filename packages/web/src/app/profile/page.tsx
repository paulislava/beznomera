import { AuthComponent, withUser } from '@/context/Auth/withUser';
import { createApi } from '@/services';
import { AUTH_COOKIE_NAME } from '@/helpers/constants';
import { cookies } from 'next/headers';
import { ProfileClient } from './ProfileClient';

const ProfilePage: AuthComponent = async ({ user }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const api = createApi(token);
  const profile = await api.user.getProfile(user.userId);

  return <ProfileClient initialProfile={profile} />;
};

export default withUser(ProfilePage);
