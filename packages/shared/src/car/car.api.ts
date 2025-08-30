import { APIRoutes, apiInfo } from '../api-routes';
import * as T from './car.types';

export interface CarApi {
  info(code: string, ...args: any[]): Promise<T.CarInfo>;
  call(body: T.CarCallBody, code: string, ...args: any[]): Promise<void>;
  list(...args: any[]): Promise<T.ShortCarInfoApi[]>;
  my(...args: any[]): Promise<T.ShortCarInfo[]>;
  sendMessage(body: T.CarMessageBody, code: string, ...args: any[]): Promise<void>;
  fullInfo(id: number, ...args: any[]): Promise<T.FullCarInfo>;
  fullInfoApi(id: number, ...args: any[]): Promise<T.FullCarInfo>;
  infoForUpdate(id: number, ...args: any[]): Promise<T.EditCarInfo>;
  infoForUpdateApi(id: number, ...args: any[]): Promise<T.EditCarInfoApi>;
  update(body: T.EditCarInfo, id: number, ...args: any[]): Promise<void>;
  create(body: T.EditCarInfo, ...args: any[]): Promise<{ id: number }>;
  sendPlate(body: T.CarPlateBody, id: number, ...args: any[]): Promise<void>;
  sendQR(body: T.CarPlateBody, id: number, ...args: any[]): Promise<void>;
  delete(id: number, ...args: any[]): Promise<void>;
  brands(...args: any[]): Promise<T.BrandInfo[]>;
  models(brandId: number, ...args: any[]): Promise<T.ModelInfo[]>;
  addOwner(body: T.AddOwnerBody, ...args: any[]): Promise<void>;
  getDrivers(carId: number, ...args: any[]): Promise<T.CarDriversInfo>;
  addDriver(body: T.AddDriverBody, ...args: any[]): Promise<void>;
  removeDriver(body: T.RemoveDriverBody, ...args: any[]): Promise<void>;
}

export const CODE_PARAM = 'code';
export const ID_PARAM = 'id';

const CAR_ROUTES: APIRoutes<CarApi> = {
  info: code => `${code || `:${CODE_PARAM}`}/info`,
  fullInfo: id => `${id || `:${ID_PARAM}`}/full-info`,
    fullInfoApi: id => `${id || `:${ID_PARAM}`}/full-info-api`, 
  call: {
    path: code => `${code || `:${CODE_PARAM}`}/call`,
    method: 'POST'
  },
  my: 'my',
  list: '',
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
  infoForUpdateApi: id => `${id || `:${ID_PARAM}`}/info-for-update-api`,
  create: {
    path: 'create',
    method: 'POST'
  },
  delete: {
    path: id => `${id || `:${ID_PARAM}`}`,
    method: 'DELETE'
  },
  brands: 'brands',
  models: {
    path: brandId => `${brandId || `:${ID_PARAM}`}/models`,
    method: 'GET'
  },
  addOwner: {
    path: ':id/add-owner',
    method: 'POST'
  },
  getDrivers: carId => `${carId || `:${ID_PARAM}`}/drivers`,
  addDriver: {
    path: ':id/add-driver',
    method: 'POST'
  },
  removeDriver: {
    path: ':id/remove-driver',
    method: 'DELETE'
  }
};

const CAR_API = apiInfo(CAR_ROUTES, 'car');
export default CAR_API;
