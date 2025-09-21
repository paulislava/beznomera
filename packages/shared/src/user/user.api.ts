import { APIRoutes, apiInfo } from '../api-routes';

import { UserBalance, UserTransaction } from './user.types';

export interface UserApi {
  balance(...args: any): Promise<UserBalance>;
  transactions(...args: any): Promise<UserTransaction[]>;
  checkUsername(username: string, ...args: any): Promise<boolean>;
}

export const USER_ROUTES: APIRoutes<UserApi> = {
  balance: () => 'balance',
  transactions: () => 'transactions',
  checkUsername: username => `check/${username || ':username'}`
};

export const USER_API = apiInfo(USER_ROUTES, 'user');
