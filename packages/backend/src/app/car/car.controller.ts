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
  Delete,
} from '@nestjs/common';
import CAR_API, {
  CODE_PARAM,
  CarApi,
  ID_PARAM,
} from '@paulislava/shared/car/car.api';
import {
  CarInfo,
  EditCarInfo,
  FullCarInfo,
  ShortCarInfo,
  ColorInfo,
  BrandInfo,
  RgbColor,
  LocationInfo,
  CarCallBody,
  CarMessageBody,
  ModelInfo,
} from '@paulislava/shared/car/car.types';
import { CarService } from './car.service';
import { CurrentUser } from '../users/user.decorator';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import userAgentParser from 'useragent';
import { Response, Request } from 'express';
import { Creatable } from '@paulislava/shared/forms';
import { ImageBody } from '@paulislava/shared/core.types';
import { RequestUser } from '../users/user.types';

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

export class ImageDto implements ImageBody {
  @IsString()
  image: string;
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

  @IsOptional()
  @IsString()
  version: Maybe<string>;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreatableRgbColorDto)
  color: Creatable<ColorInfo, RgbColor>;

  // @IsOptional()
  // @ValidateNested()
  // @Type(() => CreatableStringDto)
  // brand: Creatable<BrandInfo, string>;

  @IsOptional()
  @IsNumber()
  brand: Maybe<number>;

  @IsOptional()
  @IsString()
  code: Maybe<string>;

  @IsOptional()
  @IsNumber()
  year: Maybe<number>;

  @IsOptional()
  @IsNumber()
  imageRatio: Maybe<number>;

  @IsOptional()
  @IsString()
  imageUrl: Maybe<string>;
}

export class CarCreateDto extends CarUpdateDto {}

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
  @UseGuards(OptionalJwtAuthGuard)
  async sendMessage(
    @Body() body: CarMessageBody,
    @Param(CODE_PARAM) code: string,
    @Req() req: Request,
    @Ip() ip: string,
    @Res() res: Response,
    @CurrentUser(true) user?: RequestUser,
  ): Promise<void> {
    return this.carService.sendMessage(
      code,
      body,
      req.headers['user-agent'],
      ip,
      res,
      req,
      user,
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

  @Post(CAR_API.backendRoutes.create)
  @UseGuards(JwtAuthGuard)
  create(
    @Body() body: CarCreateDto,
    @CurrentUser() user,
  ): Promise<{ id: number }> {
    return this.carService.create(body, user).then((id) => ({ id }));
  }

  @Post(CAR_API.backendRoutes.sendPlate)
  @UseGuards(JwtAuthGuard)
  async sendPlate(
    @Body() { image }: ImageDto,
    @Param(ID_PARAM, ParseIntPipe) id: number,
    @CurrentUser() user,
  ): Promise<void> {
    await this.carService.sendPlate(image, id, user);
  }

  @Post(CAR_API.backendRoutes.sendQR)
  @UseGuards(JwtAuthGuard)
  async sendQR(
    @Body() { image }: ImageDto,
    @Param(ID_PARAM, ParseIntPipe) id: number,
    @CurrentUser() user,
  ): Promise<void> {
    await this.carService.sendQR(image, id, user);
  }

  @Delete(CAR_API.backendRoutes.delete)
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param(ID_PARAM, ParseIntPipe) id: number,
    @CurrentUser() user,
  ): Promise<void> {
    await this.carService.delete(id, user);
  }

  @Get(CAR_API.backendRoutes.brands)
  async brands(): Promise<BrandInfo[]> {
    return this.carService.getBrands();
  }

  @Get(CAR_API.backendRoutes.models)
  async models(): Promise<ModelInfo[]> {
    return this.carService.getModels();
  }
}
