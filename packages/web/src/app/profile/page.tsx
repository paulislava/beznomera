import { AuthComponent, withUser } from '@/context/Auth/withUser';
import { createApi } from '@/services';
import { AUTH_COOKIE_NAME } from '@/helpers/constants';
import { cookies } from 'next/headers';
import { ProfileClient } from './ProfileClient';
import { UserProfile } from '@shared/user/user.types';

const ProfilePage: AuthComponent = async ({ user }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const api = createApi(token);

  let profile: UserProfile;
  try {
    profile = await api.user.getProfile(user.userId);
  } catch (e) {
    console.error('getProfile failed, falling back to /me:', e);
    profile = await api.user.me();
  }

  return <ProfileClient initialProfile={profile} />;
};

export default withUser(ProfilePage);
