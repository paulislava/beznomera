import { currentUser } from '@/utils/auth-server';
import { RequestUser } from '@shared/user/user.types';

export type AuthProps = {
  user: RequestUser;
};

export type AuthComponent = React.ComponentType<AuthProps>;

// eslint-disable-next-line react/display-name
export const withUser = (Component: AuthComponent) => () => {
  if (currentUser) {
    return <Component user={currentUser} />;
  }

  console.error(`Access denied!`);

  return null;
};
