import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';

import { ConfigService } from '../config/config.service';
import { RequestUser } from '../users/user.types';

export const COOKIE_NAME = 'auth';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest(req: Request): string {
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
    return payload;
  }
}
