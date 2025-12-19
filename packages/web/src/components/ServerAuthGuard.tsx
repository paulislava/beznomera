import { AUTH_PATHNAME } from '@/helpers/constants';
import { getUserFromRequest } from '@/utils/auth';
import { redirect } from 'next/navigation';

export const ServerAuthGuard = async ({
  children,
  redirectTo
}: {
  children: React.ReactNode;
  redirectTo: string;
}) => {
  const user = await getUserFromRequest();
  if (!user) {
    return redirect(AUTH_PATHNAME + '?redirect=' + encodeURIComponent(redirectTo));
  }

  return children;
};
