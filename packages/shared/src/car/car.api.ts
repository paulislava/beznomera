import { APIRoutes, apiInfo } from '../api-routes';
import { CarInfo } from './car.types';

export interface CarApi {
  info(code: string, ...args: any[]): Promise<CarInfo>;
}

export const CODE_PARAM = 'code';

const CAR_ROUTES: APIRoutes<CarApi> = {
  info: (code: string) => `${code || `:${CODE_PARAM}`}/info`
};

const CAR_API = apiInfo(CAR_ROUTES, 'car');
export default CAR_API;
