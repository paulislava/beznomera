import { UserProfile } from '../user/user.types';

export type BrandInfo = {
  title: string;
  slug: string;
};

export type ShortCarInfo = {
  no: string;
  brandRaw: string | null;
  brand: BrandInfo | null;
  model: string | null;
  version: string | null;
  color: string | null;
  year: number | null;
};

export type CarInfo = ShortCarInfo & {
  owner: UserProfile;
};
