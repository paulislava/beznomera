import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import {
  AuthApi,
  AUTH_CONTROLLER_PATH,
  AUTH_ROUTES,
} from '@paulislava/shared/auth/auth.api';

import { ConfigService } from '../config/config.service';

import { AuthCheckDto, AuthStartDto } from './auth.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller(AUTH_CONTROLLER_PATH)
export class AuthController implements AuthApi {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post(AUTH_ROUTES.authStart())
  async authStart(@Body() data: AuthStartDto): Promise<void> {
    await this.authService.authStart(data.authMode, data.identifier);
  }

  @Post(AUTH_ROUTES.authFinish())
  async authFinish(
    @Body() data: AuthCheckDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.authFinish(
      data.authMode,
      data.identifier,
      data.code,
      res,
    );
  }

  @Get(AUTH_ROUTES.checkAuthorized())
  @UseGuards(JwtAuthGuard)
  async checkAuthorized(): Promise<void> {}
}
