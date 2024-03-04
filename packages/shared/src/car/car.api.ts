import { APIRoutes, apiInfo } from '../api-routes';
import { CarInfo } from './car.types';

export interface CarApi {
  info(code: string, ...args: any[]): Promise<CarInfo>;
  call(code: string, ...args: any[]): Promise<void>;
}

export const CODE_PARAM = 'code';

const CAR_ROUTES: APIRoutes<CarApi> = {
  info: (code: string) => `${code || `:${CODE_PARAM}`}/info`,
  call: { path: (code: string) => `${code || `:${CODE_PARAM}`}/call`, method: 'POST', noBody: true }
};

const CAR_API = apiInfo(CAR_ROUTES, 'car');
export default CAR_API;
