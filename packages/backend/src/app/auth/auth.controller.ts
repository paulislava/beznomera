import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import AUTH_API, { AuthApi } from '@paulislava/shared/auth/auth.api';
import { LinkedAccount, OAuthProvider } from '@paulislava/shared/auth/auth.types';

import { ConfigService } from '../config/config.service';

import { AuthCheckDto, AuthStartDto, AuthTelegramDto } from './auth.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthTelegramWebAppData } from '@paulislava/shared/auth/auth.types';
import { IsString, IsNotEmpty } from 'class-validator';
import { OAuthProfileData } from './strategies/oauth-profile.types';
import { CurrentUser } from '../users/user.decorator';
import { RequestUser } from '@paulislava/shared/user/user.types';
import { JwtService } from '@nestjs/jwt';
import { TOKEN_VERSION } from '@paulislava/shared/auth/auth.api';

export class AuthTelegramWebAppDataDto implements AuthTelegramWebAppData {
  @IsString()
  @IsNotEmpty()
  data: string;
}

@Controller(AUTH_API.path)
export class AuthController implements AuthApi {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  @Post(AUTH_API.backendRoutes.authStart)
  async authStart(@Body() data: AuthStartDto): Promise<void> {
    await this.authService.authStart(
      data.authMode,
      data.identifier,
      data.allowRegistration,
    );
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
  ): Promise<string> {
    return await this.authService.authTelegram(data, res);
  }

  @Get(AUTH_API.backendRoutes.checkAuthorized)
  @UseGuards(JwtAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async checkAuthorized(): Promise<void> {}

  @Post(AUTH_API.backendRoutes.logout)
  async logout(@Res({ passthrough: true }) res: Response): Promise<void> {
    res.clearCookie(this.configService.auth.jwtCookie, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
  }

  @Post(AUTH_API.backendRoutes.authTelegramWebApp)
  async authTelegramWebApp(
    @Body() { data }: AuthTelegramWebAppData,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    return await this.authService.authTelegramWebApp(data, res);
  }

  @Get(AUTH_API.backendRoutes.getLinkedAccounts)
  @UseGuards(JwtAuthGuard)
  async getLinkedAccounts(
    @CurrentUser() user: RequestUser,
  ): Promise<LinkedAccount[]> {
    return this.authService.getLinkedAccounts(user.userId);
  }

  @Delete(AUTH_API.backendRoutes.unlinkProvider)
  @UseGuards(JwtAuthGuard)
  async unlinkProvider(
    @Param('provider') provider: OAuthProvider,
    @CurrentUser() user: RequestUser,
  ): Promise<void> {
    await this.authService.unlinkOAuth(user.userId, provider);
  }

  // --- Google ---

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.handleOAuthCallback(req, res, 'google');
  }

  // --- Yandex ---

  @Get('yandex')
  @UseGuards(AuthGuard('yandex'))
  async yandexAuth() {}

  @Get('yandex/callback')
  @UseGuards(AuthGuard('yandex'))
  async yandexCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.handleOAuthCallback(req, res, 'yandex');
  }

  // --- VK ---

  @Get('vk')
  @UseGuards(AuthGuard('vkontakte'))
  async vkAuth() {}

  @Get('vk/callback')
  @UseGuards(AuthGuard('vkontakte'))
  async vkCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.handleOAuthCallback(req, res, 'vk');
  }

  // --- Apple ---

  @Post('apple')
  @UseGuards(AuthGuard('apple'))
  async appleAuth() {}

  @Post('apple/callback')
  @UseGuards(AuthGuard('apple'))
  async appleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.handleOAuthCallback(req, res, 'apple');
  }

  private async handleOAuthCallback(
    req: Request,
    res: Response,
    provider: string,
  ): Promise<void> {
    const profile = req.user as OAuthProfileData;
    const frontendUrl = this.configService.oauth?.frontendUrl ?? '';

    if (!profile) {
      res.redirect(`${frontendUrl}/auth?error=oauth_failed`);
      return;
    }

    const currentUserId = this.extractUserIdFromCookie(req);

    try {
      await this.authService.authOAuth(profile, currentUserId, res);
      res.redirect(
        `${frontendUrl}/profile?provider=${provider}&status=ok`,
      );
    } catch {
      res.redirect(`${frontendUrl}/auth?error=oauth_failed&provider=${provider}`);
    }
  }

  private extractUserIdFromCookie(req: Request): number | null {
    const cookieName = this.configService.auth.jwtCookie;
    const token = req.cookies?.[cookieName];
    if (!token) return null;
    try {
      const payload = this.jwtService.verify(token) as RequestUser;
      if (payload.tokenVersion !== TOKEN_VERSION) return null;
      return payload.userId;
    } catch {
      return null;
    }
  }
}
