import { AUTH_COOKIE_NAME } from '@/helpers/constants';
import { cookies } from 'next/headers';
import { decodeUserFromToken } from './auth';
import { RequestUser } from '@shared/user/user.types';

export let currentUser: Maybe<RequestUser>;

export const getUserFromRequest = async () => {
  const cookieStore = await cookies();

  const cookie = cookieStore.get(AUTH_COOKIE_NAME);

  if (cookie?.value) {
    currentUser = decodeUserFromToken(cookie.value, cookieStore);
    return currentUser;
  }

  return null;
};
