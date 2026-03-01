import { ImageBody } from '../core.types';
import { FileInfo } from '../file/file.types';
import { Creatable } from '../forms';
import { UserProfile } from '../user/user.types';

export type BrandInfo = {
  id: number;
  title: string;
  slug: string;
  logoUrl: string | null;
};

export type ModelInfo = {
  id: number;
  title: string;
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
  image: Maybe<FileInfo>;
  code: string;
};

export type ShortCarInfo = CarInfoBase & {
  id: number;
  brandRaw: string | null;
  brand: BrandInfo | null;
  color: ColorInfo | null;
  rawColor: RgbColor | null;
  imageUrl: Maybe<string>;
  rating?: number | null;
  ratesCount?: number;
};

export type CarInfo = ShortCarInfo & {
  owner: UserProfile;
};

export type ExtendedCarInfo = CarInfo & {
  drivers: DriverInfo[];
}

export type FullCarInfo = ExtendedCarInfo & {
  messagesCount: number;
  callsCount: number;
  chatsCount: number;
  code: string;
  rating: number | null;
  ratesCount: number;
};

export type EditCarInfo = CarInfoBase & {
  color: Creatable<ColorInfo>;
  brand: Maybe<number>;

  code: string;
};

export type EditCarInfoApi = EditCarInfo & {
  ownerId: number;
  drivers: DriverInfo[]
};

export type LocationInfo = { latitude: number; longitude: number };
export type CarCallBody = { coords?: LocationInfo };

export enum CarMessageAnswerType {
  NO = 'no',
  BOT = 'bot',
  TEL = 'tel',
  EMAIL = 'email'
}
export interface CarMessageBody {
  coords?: {
    latitude: number;
    longitude: number;
  };
  text: string;
  answerType: CarMessageAnswerType;
  tel?: string;
  email?: string;
}

export type CarPlateBody = ImageBody;

export interface TelegramContact {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  phone_number: string;
}

export interface AddOwnerBody {
  contact: TelegramContact;
  carId: number;
}

export interface DriverInfo {
  id: number;
  firstName: string;
  lastName?: string;
  nickname?: string;
  tel?: string;
  telegramID?: string;
  isOwner: boolean;
  addedAt: Date;
}

export interface AddDriverBody {
  contact: TelegramContact;
  carId: number;
}

export enum DriverRole {
  OWNER='owner',
  DRIVER='driver'
}

export interface AddDriverByUsernameBody {
  username: string;
  role?: DriverRole;
}

export interface RemoveDriverBody {
  driverId: number;
  carId: number;
}

export interface CarDriversInfo {
  carId: number;
  drivers: DriverInfo[];
  owner: DriverInfo;
}

export interface UserSearchResult {
  id: number;
  username?: string;
  firstName: string;
  lastName?: string;
  telegramID?: string;
}

export interface RateCarBody {
  rating: number; // 1-5
}