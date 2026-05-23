import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-vkontakte';

import { OAuthProvider } from '@paulislava/shared/auth/auth.types';

import { ConfigService } from '../../config/config.service';

import { OAuthProfileData } from './oauth-profile.types';

@Injectable()
export class VkStrategy extends PassportStrategy(Strategy, 'vkontakte') {
  constructor(configService: ConfigService) {
    const oauth = configService.oauth;
    super({
      clientID: oauth?.vk?.clientId ?? 'placeholder',
      clientSecret: oauth?.vk?.clientSecret ?? 'placeholder',
      callbackURL: `${oauth?.backendUrl ?? ''}/auth/vk/callback`,
      scope: ['email'],
      profileFields: ['uid', 'first_name', 'last_name', 'screen_name', 'photo_max'],
      apiVersion: '5.131',
    });
  }

  // VK always passes passReqToCallback=true internally, but arity check
  // results in (accessToken, refreshToken, profile, done) form for NestJS
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
  ): Promise<OAuthProfileData> {
    const photos = profile.photos as { value: string }[] | undefined;
    return {
      provider: OAuthProvider.VK,
      providerUserId: String(profile.id),
      email: profile.emails?.[0]?.value ?? null,
      displayName: profile.displayName ?? null,
      avatarUrl: photos?.[0]?.value ?? null,
    };
  }
}
