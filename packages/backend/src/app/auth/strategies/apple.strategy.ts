import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import { JwtService } from '@nestjs/jwt';

import { OAuthProvider } from '@paulislava/shared/auth/auth.types';

import { ConfigService } from '../../config/config.service';

import { OAuthProfileData } from './oauth-profile.types';

interface AppleIdTokenPayload {
  sub: string;
  email?: string;
  email_verified?: boolean;
}

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(
    configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    const oauth = configService.oauth;
    super({
      clientID: oauth?.apple?.clientId ?? 'placeholder',
      teamID: oauth?.apple?.teamId ?? 'placeholder',
      keyID: oauth?.apple?.keyId ?? 'placeholder',
      privateKeyString: oauth?.apple?.privateKey ?? '',
      callbackURL: `${oauth?.backendUrl ?? ''}/auth/apple/callback`,
      passReqToCallback: false,
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    idToken: string,
    _profile: any,
  ): Promise<OAuthProfileData> {
    const payload = this.jwtService.decode(idToken) as AppleIdTokenPayload;
    return {
      provider: OAuthProvider.APPLE,
      providerUserId: payload.sub,
      email: payload.email ?? null,
      displayName: null,
      avatarUrl: null,
    };
  }
}
