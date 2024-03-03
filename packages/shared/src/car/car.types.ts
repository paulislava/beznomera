import { UserProfile } from '../user/user.types';

export interface CarInfo {
  no: string;
  brand: string | null;
  model: string | null;
  version: string | null;
  color: string | null;
  year: number | null;

  owner: UserProfile;
}
