import { Controller, Get, Post } from '@nestjs/common';
import CAR_API, { CODE_PARAM, CarApi } from '@paulislava/shared/car/car.api';
import { CarInfo } from '@paulislava/shared/car/car.types';
import { CarService } from './car.service';
import { UUIDParam } from '../decorators/params.decorator';

@Controller(CAR_API.path)
export class CarController implements CarApi {
  constructor(private readonly carService: CarService) {}

  @Get(CAR_API.backendRoutes.info)
  info(@UUIDParam(CODE_PARAM) code: string): Promise<CarInfo> {
    return this.carService.getInfo(code);
  }

  @Post(CAR_API.backendRoutes.call)
  call(@UUIDParam(CODE_PARAM) code: string): Promise<void> {
    return this.carService.call(code);
  }
}
