import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-yandex';

import { OAuthProvider } from '@paulislava/shared/auth/auth.types';

import { ConfigService } from '../../config/config.service';

import { OAuthProfileData } from './oauth-profile.types';

@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy, 'yandex') {
  constructor(configService: ConfigService) {
    const oauth = configService.oauth;
    super({
      clientID: oauth?.yandex?.clientId ?? 'placeholder',
      clientSecret: oauth?.yandex?.clientSecret ?? 'placeholder',
      callbackURL: `${oauth?.backendUrl ?? ''}/auth/yandex/callback`,
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<OAuthProfileData> {
    return {
      provider: OAuthProvider.YANDEX,
      providerUserId: profile.id,
      email: profile.emails?.[0]?.value ?? null,
      displayName: profile.displayName ?? null,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    };
  }
}
