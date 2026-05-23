import { APIRoutes, apiInfo } from '../api-routes';

import { UserBalance, UserProfile, UserProfileUpdate, UserTransaction } from './user.types';

export interface UserApi {
  balance(...args: any): Promise<UserBalance>;
  transactions(...args: any): Promise<UserTransaction[]>;
  checkUsername(username: string, ...args: any): Promise<boolean>;
  me(...args: any): Promise<UserProfile>;
  getProfile(id: number, ...args: any): Promise<UserProfile>;
  updateMe(data: UserProfileUpdate, ...args: any): Promise<UserProfile>;
  deleteAvatar(...args: any): Promise<void>;
}

export const USER_ROUTES: APIRoutes<UserApi> = {
  balance: () => 'balance',
  transactions: () => 'transactions',
  checkUsername: username => `check/${username || ':username'}`,
  me: { method: 'GET', path: 'me' },
  getProfile: id => `profile/${id || ':id'}`,
  updateMe: { method: 'PATCH', path: 'me' },
  deleteAvatar: { method: 'DELETE', path: 'me/avatar' }
};

export const USER_API = apiInfo(USER_ROUTES, 'user');
