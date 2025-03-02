import {
  Body,
  Controller,
  Get,
  Ip,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import CAR_API, {
  CODE_PARAM,
  CarApi,
  CarCallBody,
  CarMessageBody,
  ID_PARAM,
  LocationInfo,
} from '@paulislava/shared/car/car.api';
import {
  CarInfo,
  EditCarInfo,
  FullCarInfo,
  ShortCarInfo,
  ColorInfo,
  BrandInfo,
  RgbColor,
} from '@paulislava/shared/car/car.types';
import { CarService } from './car.service';
import { CurrentUser } from '../users/user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import userAgentParser from 'useragent';
import { Response, Request } from 'express';
import { Creatable } from '@paulislava/shared/forms';

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

export class WithIdDto {
  @IsNumber()
  id: number;
}

export class CreatableDto<T> {
  @IsOptional()
  @ValidateNested()
  @Type(() => WithIdDto)
  value: Maybe<T>;
}

export class CreatableStringDto<T>
  extends CreatableDto<T>
  implements Creatable<T, string>
{
  @IsString()
  @IsOptional()
  newValue: Maybe<string>;
}

export class RgbColorDto implements RgbColor {
  @IsNumber()
  r: number;

  @IsNumber()
  g: number;

  @IsNumber()
  b: number;
}

export class CreatableRgbColorDto<T>
  extends CreatableDto<T>
  implements Creatable<T, RgbColor>
{
  @ValidateNested()
  @Type(() => RgbColorDto)
  newValue: RgbColor;
}
export class CarUpdateDto implements EditCarInfo {
  @IsString()
  no: string;

  @IsString()
  model: string;

  @IsString()
  @IsOptional()
  version: Maybe<string>;

  @IsObject()
  @ValidateNested()
  @Type(() => CreatableRgbColorDto)
  color: Creatable<ColorInfo, RgbColor>;

  @IsObject()
  @ValidateNested()
  @Type(() => CreatableStringDto)
  brand: Creatable<BrandInfo, string>;

  @IsString()
  code: string;

  @IsNumber()
  @IsOptional()
  year: Maybe<number>;

  @IsNumber()
  @IsOptional()
  imageRatio: Maybe<number>;

  @IsString()
  @IsOptional()
  imageUrl: Maybe<string>;
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

  @Post(CAR_API.backendRoutes.sendMessage)
  async sendMessage(
    @Body() body: CarMessageBody,
    @Param(CODE_PARAM) code: string,
    @Req() req: Request,
    @Ip() ip: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.carService.sendMessage(
      code,
      body,
      req.headers['user-agent'],
      ip,
      res,
      req,
    );
  }

  @Get(CAR_API.backendRoutes.fullInfo)
  @UseGuards(JwtAuthGuard)
  fullInfo(
    @Param(ID_PARAM, ParseIntPipe) id: number,
    @CurrentUser() user,
  ): Promise<FullCarInfo> {
    return this.carService.getFullInfo(id, user);
  }

  @Get(CAR_API.backendRoutes.infoForUpdate)
  @UseGuards(JwtAuthGuard)
  infoForUpdate(
    @Param(ID_PARAM, ParseIntPipe) id: number,
    @CurrentUser() user,
  ): Promise<EditCarInfo> {
    return this.carService.getInfoForUpdate(id, user);
  }

  @Post(CAR_API.backendRoutes.update)
  @UseGuards(JwtAuthGuard)
  update(
    @Body() body: CarUpdateDto,
    @Param(ID_PARAM, ParseIntPipe) id: number,
    @CurrentUser() user,
  ): Promise<void> {
    return this.carService.update(id, body, user);
  }
}
