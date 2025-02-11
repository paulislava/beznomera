import { UserProfile } from '../user/user.types';


export type ShortCarInfo = {
  no: string;
  brand: string | null;
  model: string | null;
  version: string | null;
  color: string | null;
  year: number | null;
}

export type CarInfo = ShortCarInfo & {
  owner: UserProfile;
}
