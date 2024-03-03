import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import AUTH_API, { AuthApi } from '@paulislava/shared/auth/auth.api';

import { ConfigService } from '../config/config.service';

import { AuthCheckDto, AuthStartDto, AuthTelegramDto } from './auth.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller(AUTH_API.path)
export class AuthController implements AuthApi {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post(AUTH_API.backendRoutes.authStart)
  async authStart(@Body() data: AuthStartDto): Promise<void> {
    await this.authService.authStart(data.authMode, data.identifier);
  }

  @Post(AUTH_API.backendRoutes.authFinish)
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

  @Post(AUTH_API.backendRoutes.authTelegram)
  async authTelegram(
    @Body() data: AuthTelegramDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.authTelegram(data, res);
  }

  @Get(AUTH_API.backendRoutes.checkAuthorized)
  @UseGuards(JwtAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async checkAuthorized(): Promise<void> {}
}
