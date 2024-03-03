import { Controller, Get, Param } from '@nestjs/common';
import {
  CAR_CONTROLLER_PATH,
  CAR_ROUTES,
  CODE_PARAM,
  CarApi,
} from '@paulislava/shared/car/car.api';
import { CarInfo } from '@paulislava/shared/car/car.types';

@Controller(CAR_CONTROLLER_PATH)
export class CarController implements CarApi {
  @Get(CAR_ROUTES.info())
  info(@Param(CODE_PARAM) code: string): Promise<CarInfo> {
    return Promise.resolve({
      brand: 'Audi',
      model: 'A4',
      year: '2014',
      color: 'black',
      no: code,
      version: 'B8',
      user: {
        firstName: 'Павел',
        lastName: 'Кондратов',
        nickname: 'paulislava',
      },
    });
  }
}
