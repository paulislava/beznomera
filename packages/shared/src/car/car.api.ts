import { APIRoutes } from '../api-routes';
import { CarInfo } from './car.types';

export interface CarApi {
  info(code: string, ...args: any[]): Promise<CarInfo>;
}

export const CAR_CONTROLLER_PATH = 'car';

export const CODE_PARAM = 'code';

export const CAR_ROUTES: APIRoutes<CarApi> = {
  info: (code: string) => `${code || `:${CODE_PARAM}`}/info`
};
