import { UserProfile } from '../user/user.types';

export interface CarInfo {
  no: string;
  brand: string;
  model: string;
  version: string;
  color: string;

  user: UserProfile;
}
