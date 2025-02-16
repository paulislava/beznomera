import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import CAR_API, { CODE_PARAM, CarApi } from '@paulislava/shared/car/car.api';
import { CarInfo, ShortCarInfo } from '@paulislava/shared/car/car.types';
import { CarService } from './car.service';
import { CurrentUser } from '../users/user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller(CAR_API.path)
export class CarController implements CarApi {
  constructor(private readonly carService: CarService) {}

  @Get(CAR_API.backendRoutes.info)
  info(@Param(CODE_PARAM) code: string): Promise<CarInfo> {
    return this.carService.getInfo(code);
  }

  @Post(CAR_API.backendRoutes.call)
  call(@Param(CODE_PARAM) code: string): Promise<void> {
    return this.carService.call(code);
  }

  @Get(CAR_API.backendRoutes.list)
  @UseGuards(JwtAuthGuard)
  list(@CurrentUser() user): Promise<ShortCarInfo[]> {
    return this.carService.list(user);
  }
}
