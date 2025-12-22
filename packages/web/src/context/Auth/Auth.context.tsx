'use client';

import { AUTH_PATHNAME } from '@/helpers/constants';
import { RequestUser } from '@shared/user/user.types';
import { redirect } from 'next/navigation';
import React, { createContext, FC, useContext, useMemo } from 'react';

const AuthContext = createContext<{ user: Maybe<RequestUser> }>({ user: null });

export const AuthProvider: FC<ChildrenProps & { user: Maybe<RequestUser> }> = ({
  children,
  user
}) => {
  // const [user, setUser] = useState<RequestUser | null>();

  // useEffect(() => {
  //   getUserFromRequest().then(setUser);
  // }, []);

  const value = useMemo(() => ({ user }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useUser = (redirectTo = '/') => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return redirect(AUTH_PATHNAME + '?redirect=' + encodeURIComponent(redirectTo));
  }

  return user;
};
