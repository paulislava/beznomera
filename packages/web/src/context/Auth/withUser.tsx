import { AUTH_PATHNAME } from '@/helpers/constants';
import { getUserFromRequest } from '@/utils/auth-server';
import { RequestUser } from '@shared/user/user.types';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export type AuthProps = {
  user: RequestUser;
};

export type AuthComponent<T = unknown> = React.ComponentType<T & AuthProps>;

export function withUser<T = unknown>(Component: AuthComponent<T>, requireAdmin?: boolean) {
  // eslint-disable-next-line react/display-name
  return async (props: T) => {
    const user = await getUserFromRequest();

    if (user && (!requireAdmin || user.isAdmin)) {
      return <Component user={user} {...props} />;
    }

    console.error(`Access denied!`);

    const headersList = await headers();
    const pathname = headersList.get('x-url') || '/';

    redirect(AUTH_PATHNAME + `?to=` + encodeURIComponent(pathname));

    return null;
  };
}
