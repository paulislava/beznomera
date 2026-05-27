import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';

import { ConfigService } from '../config/config.service';
import { RequestUser } from '@paulislava/shared/user/user.types';
import {
  AUTH_USER_TOKEN_HEADER,
  TOKEN_VERSION,
} from '@paulislava/shared/auth/auth.api';

export const COOKIE_NAME = 'auth';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest(req: Request): string {
        const authHeader = req.headers.authorization as string | undefined;
        if (authHeader?.startsWith('Bearer ')) {
          return authHeader.slice(7);
        }

        if (req.headers[AUTH_USER_TOKEN_HEADER]) {
          return req.headers[AUTH_USER_TOKEN_HEADER] as string;
        }

        const cookies: Record<string, string> = req.cookies as Record<
          string,
          string
        >;
        return cookies[configService.auth.jwtCookie];
      },
      ignoreExpiration: false,
      secretOrKey: configService.auth.jwtSecret,
    });
  }

  validate(payload: null | RequestUser): null | RequestUser {
    if (!payload.telegramID || (payload.tokenVersion ?? 0) < TOKEN_VERSION) {
      return null;
    }
    return payload;
  }
}
