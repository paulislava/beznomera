import { ImageBody } from '../core.types';
import { Creatable } from '../forms';
import { UserProfile } from '../user/user.types';

export type BrandInfo = {
  id: number;
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

type CarInfoBase = {
  no: string;
  model: Maybe<string>;
  version: Maybe<string>;
  imageRatio: Maybe<number>;
  imageUrl: Maybe<string>;
  year: Maybe<number>;
};

export type ShortCarInfo = CarInfoBase & {
  id: number;
  brandRaw: string | null;
  brand: BrandInfo | null;
  color: ColorInfo | null;
  rawColor: RgbColor | null;
  imageUrl: Maybe<string>;
};

export type CarInfo = ShortCarInfo & {
  owner: UserProfile;
};

export type FullCarInfo = ShortCarInfo & {
  messagesCount: number;
  callsCount: number;
  chatsCount: number;
  code: string;
};

export type EditCarInfo = CarInfoBase & {
  color: Creatable<ColorInfo>;
  brand: Creatable<BrandInfo>;

  code: string;
};
export type LocationInfo = { latitude: number; longitude: number };
export type CarCallBody = { coords?: LocationInfo };
export interface CarMessageBody {
  coords?: {
    latitude: number;
    longitude: number;
  };
  text: string;
}

export type CarPlateBody = ImageBody;
