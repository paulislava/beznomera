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
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  nickname?: string;
  tel?: string;
  id: number;
}

export interface RequestUser {
  userId: number;
  telegramID: string;
}
