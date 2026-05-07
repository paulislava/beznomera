'use client';

import { AUTH_PATHNAME } from '@/helpers/constants';
import { RequestUser } from '@shared/user/user.types';
import { redirect } from 'next/navigation';
import React, { createContext, FC, useContext, useEffect, useMemo, useState } from 'react';

export const AuthContext = createContext<{ user: Maybe<RequestUser> }>({ user: null });

export const AuthProvider: FC<ChildrenProps> = ({ children }) => {
  const [user, setUser] = useState<Maybe<RequestUser>>(null);

  useEffect(() => {
    fetch('/api/auth/user')
      .then(res => (res.ok ? res.json() : null))
      .then(data => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

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
