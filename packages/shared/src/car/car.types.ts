import { UserProfile } from '../user/user.types';

export type BrandInfo = {
  title: string;
  slug: string;
  logoUrl: string | null;
};

export type RgbColor = {
  r: number;
  g: number;
  b: number;
};

export type ColorInfo = {
  id: number;
  value: RgbColor;
  title: string;
};

export type ShortCarInfo = {
  id: number;
  no: string;
  brandRaw: string | null;
  brand: BrandInfo | null;
  model: string | null;
  version: string | null;
  color: ColorInfo | null;
  rawColor: RgbColor | null;
  year: number | null;
};

export type CarInfo = ShortCarInfo & {
  owner: UserProfile;
};
