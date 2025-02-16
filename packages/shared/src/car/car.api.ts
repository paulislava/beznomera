import { APIRoutes, apiInfo } from '../api-routes';
import { CarInfo, ShortCarInfo } from './car.types';

export interface CarApi {
  info(code: string, ...args: any[]): Promise<CarInfo>;
  call(code: string, ...args: any[]): Promise<void>;
  list(...args: any[]): Promise<ShortCarInfo[]>;
}

export const CODE_PARAM = 'code';

const CAR_ROUTES: APIRoutes<CarApi> = {
  info: (code: string) => `${code || `:${CODE_PARAM}`}/info`,
  call: {
    path: (code: string) => `${code || `:${CODE_PARAM}`}/call`,
    method: 'POST',
    noBody: true
  },
  list: () => `list`
};

const CAR_API = apiInfo(CAR_ROUTES, 'car');
export default CAR_API;
