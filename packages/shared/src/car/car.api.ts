import { APIRoutes, apiInfo } from '../api-routes';
import { CarInfo, FullCarInfo, ShortCarInfo } from './car.types';

export type LocationInfo = { latitude: number; longitude: number };
export type CarCallBody = { coords?: LocationInfo };
export type CarMessageBody = { coords?: LocationInfo; text: string };

export interface CarApi {
  info(code: string, ...args: any[]): Promise<CarInfo>;
  call(body: CarCallBody, code: string, ...args: any[]): Promise<void>;
  list(...args: any[]): Promise<ShortCarInfo[]>;
  sendMessage(body: CarMessageBody, code: string, ...args: any[]): Promise<void>;
  fullInfo(id: number, ...args: any[]): Promise<FullCarInfo>;
}

export const CODE_PARAM = 'code';
export const ID_PARAM = 'id';

const CAR_ROUTES: APIRoutes<CarApi> = {
  info: code => `${code || `:${CODE_PARAM}`}/info`,
  fullInfo: id => `${id || `:${ID_PARAM}`}/full-info`,
  call: {
    path: code => `${code || `:${CODE_PARAM}`}/call`,
    method: 'POST'
  },
  list: () => `list`,
  sendMessage: {
    path: code => `${code || `:${CODE_PARAM}`}/message`,
    method: 'POST'
  }
};

const CAR_API = apiInfo(CAR_ROUTES, 'car');
export default CAR_API;
