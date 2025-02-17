import {
  Body,
  Controller,
  Get,
  Ip,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import CAR_API, {
  CODE_PARAM,
  CarApi,
  CarCallBody,
  LocationInfo,
} from '@paulislava/shared/car/car.api';
import { CarInfo, ShortCarInfo } from '@paulislava/shared/car/car.types';
import { CarService } from './car.service';
import { CurrentUser } from '../users/user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import userAgentParser from 'useragent';

class LocationDto implements LocationInfo {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class CarCallDto implements CarCallBody {
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  coords?: LocationInfo;
}

@Controller(CAR_API.path)
export class CarController implements CarApi {
  constructor(private readonly carService: CarService) {}

  @Get(CAR_API.backendRoutes.info)
  info(@Param(CODE_PARAM) code: string): Promise<CarInfo> {
    return this.carService.getInfo(code);
  }

  @Post(CAR_API.backendRoutes.call)
  async call(
    @Body() body: CarCallDto,
    @Param(CODE_PARAM) code: string,
    @Req() req: Request,
    @Ip() ip: string,
  ): Promise<void> {
    const agent = userAgentParser.parse(req.headers['user-agent']);

    return this.carService.call(code, body, agent, ip);
  }

  @Get(CAR_API.backendRoutes.list)
  @UseGuards(JwtAuthGuard)
  list(@CurrentUser() user): Promise<ShortCarInfo[]> {
    return this.carService.list(user);
  }
}
