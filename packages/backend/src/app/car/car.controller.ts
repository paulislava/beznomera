import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import CAR_API, { CODE_PARAM, CarApi } from '@paulislava/shared/car/car.api';
import { CarInfo } from '@paulislava/shared/car/car.types';
import { CarService } from './car.service';

@Controller(CAR_API.path)
export class CarController implements CarApi {
  constructor(private readonly carService: CarService) {}

  @Get(CAR_API.backendRoutes.info)
  info(@Param(CODE_PARAM, new ParseUUIDPipe()) code: string): Promise<CarInfo> {
    return this.carService.getInfo(code);
  }
}
