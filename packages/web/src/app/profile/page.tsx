import { AuthComponent, withUser } from '@/context/Auth/withUser';
import { userService } from '@/services';
import { ProfileClient } from './ProfileClient';

const ProfilePage: AuthComponent = async ({ user }) => {
  const profile = await userService.getProfile(user.userId);

  return <ProfileClient initialProfile={profile} />;
};

export default withUser(ProfilePage);
