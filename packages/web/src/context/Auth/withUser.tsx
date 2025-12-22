import { AUTH_PATHNAME } from '@/helpers/constants';
import { getUserFromRequest } from '@/utils/auth-server';
import { RequestUser } from '@shared/user/user.types';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export type AuthProps = {
  user: RequestUser;
};

export type AuthComponent<T = any> = React.ComponentType<AuthProps & T>;

export function withUser<T = any>(Component: AuthComponent<T>) {
  // eslint-disable-next-line react/display-name
  return async (props: T) => {
    const user = await getUserFromRequest();

    if (user) {
      return <Component user={user} {...props} />;
    }

    console.error(`Access denied!`);

    const headersList = await headers();
    const pathname = headersList.get('x-url') || '/';

    redirect(AUTH_PATHNAME + `?to=` + encodeURIComponent(pathname));

    return null;
  };
}
