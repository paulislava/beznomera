'use client';

import { AUTH_PATHNAME } from '@/helpers/constants';
import { getStoredAuthToken } from '@/utils/auth-storage';
import { RequestUser } from '@shared/user/user.types';
import { redirect } from 'next/navigation';
import React, { createContext, FC, useContext, useMemo } from 'react';

function parseUserFromToken(token: string): Maybe<RequestUser> {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.userId ? (payload as RequestUser) : null;
  } catch {
    return null;
  }
}

export const AuthContext = createContext<{ user: Maybe<RequestUser> }>({ user: null });

export const AuthProvider: FC<ChildrenProps> = ({ children }) => {
  const user = useMemo(() => {
    const token = getStoredAuthToken();
    return token ? parseUserFromToken(token) : null;
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
