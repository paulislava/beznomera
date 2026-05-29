import { AuthComponent, withUser } from '@/context/Auth/withUser';
import { createApi } from '@/services';
import { ProfileClient } from './ProfileClient';
import { UserProfile } from '@shared/user/user.types';

const api = createApi();

const ProfilePage: AuthComponent = async ({ user }) => {
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
