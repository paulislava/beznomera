import { APIRoutes, apiInfo } from '../api-routes';
import { CarInfo, ShortCarInfo } from './car.types';

export type LocationInfo = { latitude: number; longitude: number };
export type CarCallBody = { coords?: LocationInfo };
export type CarMessageBody = { coords?: LocationInfo; text: string };

export interface CarApi {
  info(code: string, ...args: any[]): Promise<CarInfo>;
  call(body: CarCallBody, code: string, ...args: any[]): Promise<void>;
  list(...args: any[]): Promise<ShortCarInfo[]>;
  sendMessage(body: CarMessageBody, code: string, ...args: any[]): Promise<void>;
}

export const CODE_PARAM = 'code';

const CAR_ROUTES: APIRoutes<CarApi> = {
  info: (code: string) => `${code || `:${CODE_PARAM}`}/info`,
  call: {
    path: (code: string) => `${code || `:${CODE_PARAM}`}/call`,
    method: 'POST'
  },
  list: () => `list`,
  sendMessage: {
    path: (code: string) => `${code || `:${CODE_PARAM}`}/message`,
    method: 'POST'
  }
};

const CAR_API = apiInfo(CAR_ROUTES, 'car');
export default CAR_API;
