import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';

import { OAuthProvider } from '@paulislava/shared/auth/auth.types';

import { ConfigService } from '../../config/config.service';

import { OAuthProfileData } from './oauth-profile.types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    const oauth = configService.oauth;
    super({
      clientID: oauth?.google?.clientId ?? 'placeholder',
      clientSecret: oauth?.google?.clientSecret ?? 'placeholder',
      callbackURL: `${oauth?.backendUrl ?? ''}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<OAuthProfileData> {
    return {
      provider: OAuthProvider.GOOGLE,
      providerUserId: profile.id,
      email: profile.emails?.[0]?.value ?? null,
      displayName: profile.displayName ?? null,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    };
  }
}
