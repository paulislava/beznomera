import { LinkedAccount } from '../auth/auth.types';

export interface UserBalance {
  pure: number;
  bonus: number;
  full: number;
}

export interface UserTransaction {
  date: string;
  title: string | null;
  summ: number;
  bonusSumm: number;
  id: string;
}

export interface UserProfile {
  id: number;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  nickname?: string;
  tel?: string;
  email?: string;
  linkedAccounts?: LinkedAccount[];
}

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  nickname?: string;
}

export interface RequestUser {
  userId: number;
  telegramID: string;
  isAdmin?: boolean;
  tokenVersion: number;
}
