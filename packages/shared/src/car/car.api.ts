import { APIRoutes, apiInfo } from '../api-routes';
import {
  CarCallBody,
  CarInfo,
  CarMessageBody,
  EditCarInfo,
  FullCarInfo,
  ShortCarInfo,
  CarPlateBody
} from './car.types';

export interface CarApi {
  info(code: string, ...args: any[]): Promise<CarInfo>;
  call(body: CarCallBody, code: string, ...args: any[]): Promise<void>;
  list(...args: any[]): Promise<ShortCarInfo[]>;
  sendMessage(body: CarMessageBody, code: string, ...args: any[]): Promise<void>;
  fullInfo(id: number, ...args: any[]): Promise<FullCarInfo>;
  infoForUpdate(id: number, ...args: any[]): Promise<EditCarInfo>;
  update(body: EditCarInfo, id: number, ...args: any[]): Promise<void>;
  create(body: EditCarInfo, ...args: any[]): Promise<{ id: number }>;
  sendPlate(body: CarPlateBody, id: number, ...args: any[]): Promise<void>;
  sendQR(body: CarPlateBody, id: number, ...args: any[]): Promise<void>;
  delete(id: number, ...args: any[]): Promise<void>;
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
  list: 'list',
  sendMessage: {
    path: code => `${code || `:${CODE_PARAM}`}/message`,
    method: 'POST'
  },
  update: {
    path: id => `${id || `:${ID_PARAM}`}/update`,
    method: 'POST'
  },
  sendPlate: {
    path: id => `${id || `:${ID_PARAM}`}/send-plate`,
    method: 'POST'
  },
  sendQR: {
    path: id => `${id || `:${ID_PARAM}`}/send-qr`,
    method: 'POST'
  },
  infoForUpdate: id => `${id || `:${ID_PARAM}`}/info-for-update`,
  create: {
    path: 'create',
    method: 'POST'
  },
  delete: {
    path: id => `${id || `:${ID_PARAM}`}`,
    method: 'DELETE'
  }
};

const CAR_API = apiInfo(CAR_ROUTES, 'car');
export default CAR_API;
